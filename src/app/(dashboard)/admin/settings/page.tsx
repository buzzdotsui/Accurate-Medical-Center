export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-heading font-bold text-foreground">Settings</h1>
      <p className="text-muted-foreground">System configuration, roles, departments, and integrations.</p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          { title: "Hospital Profile", desc: "Update hospital name, contact, and address information." },
          { title: "Roles & Permissions", desc: "Configure role-based access for each user type." },
          { title: "Departments", desc: "Add or edit clinical and administrative departments." },
          { title: "Notifications", desc: "Configure system alerts and email notification preferences." },
          { title: "Integrations", desc: "Connect with NHIS, lab equipment, or payment gateways." },
          { title: "Audit Logs", desc: "Review all system access and data modification events." },
        ].map((item) => (
          <div key={item.title} className="border rounded-xl bg-card p-5 hover:border-primary/40 transition-colors cursor-pointer space-y-2">
            <h3 className="font-semibold text-foreground">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
