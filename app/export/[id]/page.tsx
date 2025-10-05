import { createClient } from "@/lib/supabase/server"
import { Nav } from "@/components/nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { notFound, redirect } from "next/navigation"

export default async function ExportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: project } = await supabase.from("projects").select("*").eq("id", id).single()

  if (!project) {
    notFound()
  }

  // Fetch pages and links for export
  const { data: pages } = await supabase.from("pages").select("*").eq("project_id", id)

  return (
    <div className="flex min-h-svh flex-col">
      <Nav />
      <main className="flex-1 px-4 py-8">
        <div className="container mx-auto max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Export: {project.name}</CardTitle>
              <CardDescription>Export your project data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Project Summary</h3>
                  <p className="text-sm text-muted-foreground">{pages?.length || 0} page(s) in this project</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">Export as JSON</Button>
                  <Button variant="outline">Export as CSV</Button>
                  <Button variant="outline">Export as PDF</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
