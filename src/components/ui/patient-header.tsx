import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Phone, MapPin, CalendarDays, Activity } from "lucide-react"

export interface PatientHeaderProps {
  patient: {
    id: string
    name: string
    hospitalNumber: string
    dateOfBirth: Date | string
    gender: string
    bloodGroup?: string
    genotype?: string
    phone?: string
    email?: string
    address?: string
    imageUrl?: string
  }
}

export function PatientHeader({ patient }: PatientHeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const calculateAge = (dob: Date | string) => {
    const diff_ms = Date.now() - new Date(dob).getTime()
    const age_dt = new Date(diff_ms)
    return Math.abs(age_dt.getUTCFullYear() - 1970)
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 border rounded-lg bg-card text-card-foreground">
      <div className="flex-shrink-0 flex items-center justify-center">
        <Avatar className="h-24 w-24 border-2 border-primary/20">
          <AvatarImage src={patient.imageUrl} alt={patient.name} />
          <AvatarFallback className="text-2xl font-medium bg-primary/10 text-primary">
            {getInitials(patient.name)}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="flex flex-col justify-center flex-1 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight">{patient.name}</h2>
              <Badge variant="outline" className="font-mono bg-muted/50">
                {patient.hospitalNumber}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mt-1">
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>
                  {patient.gender} • {calculateAge(patient.dateOfBirth)} yrs
                </span>
              </div>
              {patient.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  <span>{patient.phone}</span>
                </div>
              )}
              {patient.address && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate max-w-[200px]">{patient.address}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {patient.bloodGroup && (
              <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1">
                <Activity className="w-3.5 h-3.5 text-destructive" />
                Blood: {patient.bloodGroup}
              </Badge>
            )}
            {patient.genotype && (
              <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1">
                <Activity className="w-3.5 h-3.5 text-info" />
                Genotype: {patient.genotype}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
