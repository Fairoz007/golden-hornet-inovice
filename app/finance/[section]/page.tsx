import { FinanceWorkspace } from "@/components/finance-workspace"
export default async function Page({params}: {params: Promise<{section:string}>}) { const {section} = await params; return <FinanceWorkspace section={section} /> }
