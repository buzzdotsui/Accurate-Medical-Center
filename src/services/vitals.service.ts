import { prisma } from '@/lib/db/client';
import { SaveVitalsInput } from '@/lib/validations/vitals';
import { AppError } from '@/lib/api/errors';
import { AuditService } from './audit.service';

export function calcBMI(weightKg?: number, heightCm?: number): number | undefined {
  if (!weightKg || !heightCm || heightCm <= 0) return undefined;
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

export function calcBSA(weightKg?: number, heightCm?: number): number | undefined {
  if (!weightKg || !heightCm) return undefined;
  return Number(Math.sqrt((weightKg * heightCm) / 3600).toFixed(2));
}

export function classifyBP(bp?: string): string | undefined {
  if (!bp) return undefined;
  const parts = bp.split('/').map(Number);
  if (parts.length !== 2 || parts.some(isNaN)) return undefined;
  const [sys, dia] = parts;
  if (sys >= 180 || dia >= 120) return 'HYPERTENSIVE_CRISIS';
  if (sys >= 140 || dia >= 90) return 'HYPERTENSION_STAGE_2';
  if (sys >= 130 || dia >= 80) return 'HYPERTENSION_STAGE_1';
  if (sys >= 120 && dia < 80) return 'ELEVATED';
  if (sys < 90 || dia < 60) return 'HYPOTENSION';
  return 'NORMAL';
}

export class VitalsService {
  static async saveVitals(data: SaveVitalsInput, executorId: string) {
    const visit = await prisma.visit.findUnique({
      where: { id: data.visitId },
      include: { patient: true }
    });
    
    if (!visit) throw new AppError('Visit not found', 'NOT_FOUND', 404);
    if (visit.status === 'COMPLETED') throw new AppError('Visit is already completed', 'VALIDATION_ERROR', 400);

    const bmi = calcBMI(data.weight, data.height);
    const bsa = calcBSA(data.weight, data.height);
    const bpClass = classifyBP(data.bloodPressure || undefined);

    const updatedVisit = await prisma.visit.update({
      where: { id: data.visitId },
      data: {
        vitals: {
          bloodPressure: data.bloodPressure,
          heartRate: data.heartRate,
          temperature: data.temperature,
          respiratoryRate: data.respiratoryRate,
          oxygenSaturation: data.oxygenSaturation,
          weight: data.weight,
          height: data.height,
          bmi,
          bsa,
          bloodPressureClassification: bpClass,
          notes: data.notes,
          recordedAt: new Date().toISOString(),
          recordedBy: executorId
        }
      }
    });

    await AuditService.log({
      userId: executorId,
      userRole: 'NURSE',
      action: 'RECORD_VITALS',
      resource: 'VISIT',
      resourceId: visit.id,
      branchId: visit.patient.branchId,
      details: { patientId: visit.patientId, bmi, bpClass }
    }).catch(() => {});

    return { ...updatedVisit, computed: { bmi, bsa, bpClass } };
  }

  static async getVitalsByVisit(visitId: string) {
    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      select: { id: true, vitals: true, status: true, startedAt: true }
    });
    if (!visit) throw new AppError('Visit not found', 'NOT_FOUND', 404);
    return visit.vitals;
  }
}
