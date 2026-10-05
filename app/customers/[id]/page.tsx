import { CustomerWorkspace } from "@/components/customer-workspace"
export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  return <CustomerWorkspace customerId={(await params).id} />
}
