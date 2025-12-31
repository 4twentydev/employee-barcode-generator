import { redirect } from "next/navigation";

type PrintPageProps = {
  searchParams?: { id?: string; count?: string };
};

export default async function PrintPage({ searchParams }: PrintPageProps) {
  const employeeId = searchParams?.id;

  if (!employeeId) {
    redirect("/label");
  }

  const params = new URLSearchParams();
  if (searchParams?.count) {
    params.set("count", searchParams.count);
  }
  const suffix = params.toString();
  redirect(`/print/${employeeId}${suffix ? `?${suffix}` : ""}`);
}
