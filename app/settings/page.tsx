"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import {
  Settings,
  Building2,
  Landmark,
  Image as ImageIcon,
  Sliders,
  CheckCircle2,
  RotateCcw,
  UploadCloud,
  FileCheck,
  Shield,
  HelpCircle,
  Save,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { invoiceStore, AppSettings } from "@/lib/invoice-store"
import { GOLDEN_HORNET_COMPANY } from "@/lib/dummy-data"

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const saveFailed = useRef(false)
  const [activeTab, setActiveTab] = useState("company")

  // File upload refs
  const logoInputRef = useRef<HTMLInputElement>(null)
  const letterheadInputRef = useRef<HTMLInputElement>(null)
  const stampInputRef = useRef<HTMLInputElement>(null)
  const signatureInputRef = useRef<HTMLInputElement>(null)

  // Local form state
  const [companyForm, setCompanyForm] = useState({
    name: "",
    arabicName: "",
    crNumber: "",
    vatin: "",
    address: "",
    tel: "",
    fax: "",
    email: "",
    website: "",
  })

  const [bankForm, setBankForm] = useState({
    bankName: "",
    companyName: "",
    accountNumber: "",
    swiftCode: "",
    iban: "",
    branch: "",
  })

  const [invoiceConfigForm, setInvoiceConfigForm] = useState({
    defaultVatRate: 5.0,
    startingInvoiceSequence: 1250,
    invoiceFormat: "{seq}-{year}",
    paymentTerms: "",
  })

  const [assetToggles, setAssetToggles] = useState({
    enableStamp: true,
    enableSignature: true,
  })

  const [assets, setAssets] = useState({
    logoUrl: "/images/logo.png",
    letterheadUrl: "/images/letter_head.png",
    stampUrl: "/images/stamp.png",
    signatureUrl: "/images/signature.png",
  })

  // Load settings on mount
  useEffect(() => {
    const s = invoiceStore.getSettings()
    setSettings(s)
    setCompanyForm(s.companyDetails)
    setBankForm(s.bankDetails)
    setInvoiceConfigForm({
      defaultVatRate: s.defaultVatRate,
      startingInvoiceSequence: s.startingInvoiceSequence,
      invoiceFormat: s.invoiceFormat,
      paymentTerms: s.paymentTerms,
    })
    setAssetToggles({
      enableStamp: s.enableStamp,
      enableSignature: s.enableSignature,
    })
    setAssets({
      logoUrl: s.logoUrl,
      letterheadUrl: s.letterheadUrl,
      stampUrl: s.stampUrl,
      signatureUrl: s.signatureUrl,
    })
  }, [])

  const persistSettings = (...args: Parameters<typeof invoiceStore.updateSettings>) => {
    try {
      invoiceStore.updateSettings(...args)
      saveFailed.current = false
      setErrorMessage(null)
      return true
    } catch (error) {
      saveFailed.current = true
      setSuccessMessage(null)
      setErrorMessage(error instanceof Error ? `Settings were not saved: ${error.message}` : "Settings were not saved. Browser storage may be full.")
      return false
    }
  }
  const showNotification = (msg: string) => {
    if (saveFailed.current) return
    setSuccessMessage(msg)
    setTimeout(() => {
      setSuccessMessage(null)
    }, 4000)
  }

  // Handle file uploads
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    assetType: "logoUrl" | "letterheadUrl" | "stampUrl" | "signatureUrl",
    actionName: string,
    description: string
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    setErrorMessage(null)
    if (!file.type.startsWith("image/")) { setErrorMessage("Choose an image file for this company asset."); e.target.value = ""; return }
    if (file.size > 1_000_000) { setErrorMessage("Company asset images must be under 1 MB to fit this browser workspace."); e.target.value = ""; return }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      if (dataUrl) {
        if (persistSettings({ [assetType]: dataUrl }, { action: actionName, description })) {
          setAssets((prev) => ({ ...prev, [assetType]: dataUrl }))
          showNotification(`${description} saved successfully.`)
        }
      }
    }
    reader.onerror = () => setErrorMessage("The image could not be read. Please choose it again.")
    reader.readAsDataURL(file)
  }

  // Reset asset to default
  const handleResetAsset = (
    assetType: "logoUrl" | "letterheadUrl" | "stampUrl" | "signatureUrl",
    defaultPath: string,
    label: string
  ) => {
    const saved = persistSettings(
      { [assetType]: defaultPath },
      {
        action: `${assetType.toUpperCase().replace("URL", "")}_RESET`,
        description: `Reset ${label} to official Golden Hornet default asset.`,
      }
    )
    if (saved) {
      setAssets((prev) => ({ ...prev, [assetType]: defaultPath }))
      showNotification(`Reset ${label} to official default.`)
    }
  }

  // Save company details
  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault()
    persistSettings(
      { companyDetails: companyForm },
      {
        action: "COMPANY_SETTINGS_CHANGED",
        description: `Company details updated (CR: ${companyForm.crNumber}, VATIN: ${companyForm.vatin}).`,
      }
    )
    showNotification("Company details updated and logged to audit trail.")
  }

  // Save bank details
  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault()
    persistSettings(
      { bankDetails: bankForm },
      {
        action: "BANK_DETAILS_CHANGED",
        description: `Bank details updated (${bankForm.bankName} - A/C ${bankForm.accountNumber}).`,
      }
    )
    showNotification("Bank disbursement details updated and logged.")
  }

  // Save invoice config
  const handleSaveInvoiceConfig = (e: React.FormEvent) => {
    e.preventDefault()
    persistSettings(
      {
        defaultVatRate: Number(invoiceConfigForm.defaultVatRate),
        startingInvoiceSequence: Number(invoiceConfigForm.startingInvoiceSequence),
        invoiceFormat: invoiceConfigForm.invoiceFormat,
        paymentTerms: invoiceConfigForm.paymentTerms,
      },
      {
        action: "INVOICE_CONFIG_CHANGED",
        description: `Invoice settings updated: VAT ${invoiceConfigForm.defaultVatRate}%, sequence start #${invoiceConfigForm.startingInvoiceSequence}.`,
      }
    )
    showNotification("Invoice defaults and numbering format updated.")
  }

  // Toggle Stamp / Signature default
  const handleToggleStamp = (enabled: boolean) => {
    setAssetToggles((prev) => ({ ...prev, enableStamp: enabled }))
    persistSettings(
      { enableStamp: enabled },
      {
        action: "STAMP_TOGGLED",
        description: enabled
          ? "Official C.R. 1000156 round seal enabled on invoices."
          : "Official stamp disabled on invoices.",
      }
    )
    showNotification(
      enabled ? "Official stamp enabled on new invoices." : "Official stamp disabled on new invoices."
    )
  }

  const handleToggleSignature = (enabled: boolean) => {
    setAssetToggles((prev) => ({ ...prev, enableSignature: enabled }))
    persistSettings(
      { enableSignature: enabled },
      {
        action: "SIGNATURE_TOGGLED",
        description: enabled
          ? "Authorized signature enabled on invoices."
          : "Authorized signature disabled on invoices.",
      }
    )
    showNotification(
      enabled
        ? "Authorized signature enabled on new invoices."
        : "Authorized signature disabled on new invoices."
    )
  }

  // Reset everything to Golden Hornet baseline
  const handleResetToBaseline = () => {
    if (
      !confirm(
        "Are you sure you want to restore all company, banking, and asset settings to Golden Hornet defaults?"
      )
    ) {
      return
    }

    const baselineCompany = {
      name: GOLDEN_HORNET_COMPANY.name,
      arabicName: GOLDEN_HORNET_COMPANY.arabicName,
      crNumber: GOLDEN_HORNET_COMPANY.crNumber,
      vatin: GOLDEN_HORNET_COMPANY.vatin,
      address: GOLDEN_HORNET_COMPANY.address,
      tel: GOLDEN_HORNET_COMPANY.tel,
      fax: GOLDEN_HORNET_COMPANY.fax,
      email: GOLDEN_HORNET_COMPANY.email,
      website: GOLDEN_HORNET_COMPANY.website,
    }

    const baselineBank = {
      bankName: GOLDEN_HORNET_COMPANY.bankName,
      companyName: GOLDEN_HORNET_COMPANY.name,
      accountNumber: GOLDEN_HORNET_COMPANY.accountNumber,
      swiftCode: GOLDEN_HORNET_COMPANY.swiftCode,
      iban: GOLDEN_HORNET_COMPANY.iban,
      branch: GOLDEN_HORNET_COMPANY.branch,
    }

    setCompanyForm(baselineCompany)
    setBankForm(baselineBank)
    setInvoiceConfigForm({
      defaultVatRate: 5.0,
      startingInvoiceSequence: 1250,
      invoiceFormat: "{seq}-{year}",
      paymentTerms: GOLDEN_HORNET_COMPANY.paymentTerms,
    })
    setAssetToggles({
      enableStamp: true,
      enableSignature: true,
    })
    setAssets({
      logoUrl: "/images/logo.png",
      letterheadUrl: "/images/letter_head.png",
      stampUrl: "/images/stamp.png",
      signatureUrl: "/images/signature.png",
    })

    persistSettings(
      {
        companyDetails: baselineCompany,
        bankDetails: baselineBank,
        defaultVatRate: 5.0,
        startingInvoiceSequence: 1250,
        invoiceFormat: "{seq}-{year}",
        paymentTerms: GOLDEN_HORNET_COMPANY.paymentTerms,
        enableStamp: true,
        enableSignature: true,
        logoUrl: "/images/logo.png",
        letterheadUrl: "/images/letter_head.png",
        stampUrl: "/images/stamp.png",
        signatureUrl: "/images/signature.png",
      },
      {
        action: "SETTINGS_RESTORED_BASELINE",
        description: "Restored all system settings to Golden Hornet LLC defaults.",
      }
    )

    showNotification("Restored all configuration to Golden Hornet defaults.")
  }

  if (!settings) {
    return <div className="p-8 text-center text-slate-500">Loading settings...</div>
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Top Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Settings className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Company & Invoice Settings
              </h1>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Manage Golden Hornet LLC corporate identity, official banking data, asset files (logo, letterhead, seal, sign), and Oman VAT compliance defaults.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToBaseline}
              className="text-xs text-slate-600 border-slate-300 hover:bg-slate-100 gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset to Defaults</span>
            </Button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {errorMessage && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{errorMessage}</p>}
        {successMessage && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2 shadow-2xs transition-all">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {/* Regulatory Protection Callout */}
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-4 text-xs text-slate-700 flex items-start gap-3 shadow-2xs">
          <Shield className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-amber-900">
              Immutable Document Protection Notice:
            </div>
            <p className="text-slate-600 leading-relaxed">
              Modifications made in this panel will be applied to all <strong>future invoices</strong> and drafts.
              Previously finalized or paid invoices retain permanent, frozen snapshots of the company registration, bank disbursement coordinates, and digital letterhead templates used at their time of creation, guaranteeing zero historical tampering.
            </p>
          </div>
        </div>

        {/* Main Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white p-1 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-2 md:grid-cols-4 gap-1 h-auto">
            <TabsTrigger
              value="company"
              className="flex items-center gap-2 py-2 text-xs font-semibold data-[state=active]:bg-amber-600 data-[state=active]:text-white"
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Company Profile</span>
            </TabsTrigger>
            <TabsTrigger
              value="bank"
              className="flex items-center gap-2 py-2 text-xs font-semibold data-[state=active]:bg-amber-600 data-[state=active]:text-white"
            >
              <Landmark className="h-3.5 w-3.5" />
              <span>Bank Disbursement</span>
            </TabsTrigger>
            <TabsTrigger
              value="assets"
              className="flex items-center gap-2 py-2 text-xs font-semibold data-[state=active]:bg-amber-600 data-[state=active]:text-white"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span>Assets & Seal</span>
            </TabsTrigger>
            <TabsTrigger
              value="numbering"
              className="flex items-center gap-2 py-2 text-xs font-semibold data-[state=active]:bg-amber-600 data-[state=active]:text-white"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>VAT & Sequencing</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Company Profile */}
          <TabsContent value="company" className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
              <div className="border-b border-slate-100 pb-4 mb-5">
                <h3 className="text-base font-bold text-slate-900">
                  Golden Hornet LLC Corporate Information
                </h3>
                <p className="text-xs text-slate-500">
                  Legal registration, bilingual names, commercial register, and official contact coordinates.
                </p>
              </div>

              <form onSubmit={handleSaveCompany} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="company-name" className="text-xs font-semibold text-slate-700">
                      Company Name (English) <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="company-name"
                      value={companyForm.name}
                      onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                      required
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="company-arabic"
                      className="text-xs font-semibold text-slate-700 flex justify-between"
                    >
                      <span>Company Name (Arabic)</span>
                      <span className="font-arabic text-amber-800">اسم الشركة بالعربية</span>
                    </Label>
                    <Input
                      id="company-arabic"
                      value={companyForm.arabicName}
                      onChange={(e) =>
                        setCompanyForm({ ...companyForm, arabicName: e.target.value })
                      }
                      dir="rtl"
                      className="text-xs font-arabic"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="company-cr" className="text-xs font-semibold text-slate-700">
                      Commercial Registration (C.R. No) <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="company-cr"
                      value={companyForm.crNumber}
                      onChange={(e) =>
                        setCompanyForm({ ...companyForm, crNumber: e.target.value })
                      }
                      required
                      className="text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="company-vatin" className="text-xs font-semibold text-slate-700">
                      Tax Identification (VATIN) <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="company-vatin"
                      value={companyForm.vatin}
                      onChange={(e) => setCompanyForm({ ...companyForm, vatin: e.target.value })}
                      required
                      className="text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="company-address" className="text-xs font-semibold text-slate-700">
                    Official Head Office Address (Sohar, Sultanate of Oman)
                  </Label>
                  <Input
                    id="company-address"
                    value={companyForm.address}
                    onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                    className="text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="company-tel" className="text-xs font-semibold text-slate-700">
                      Telephone / Mobile
                    </Label>
                    <Input
                      id="company-tel"
                      value={companyForm.tel}
                      onChange={(e) => setCompanyForm({ ...companyForm, tel: e.target.value })}
                      className="text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="company-fax" className="text-xs font-semibold text-slate-700">
                      Fax Number
                    </Label>
                    <Input
                      id="company-fax"
                      value={companyForm.fax}
                      onChange={(e) => setCompanyForm({ ...companyForm, fax: e.target.value })}
                      className="text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="company-email" className="text-xs font-semibold text-slate-700">
                      Official Email
                    </Label>
                    <Input
                      id="company-email"
                      type="email"
                      value={companyForm.email}
                      onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="company-web" className="text-xs font-semibold text-slate-700">
                      Website URL
                    </Label>
                    <Input
                      id="company-web"
                      value={companyForm.website}
                      onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold gap-1.5 shadow-xs"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Company Information</span>
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>

          {/* TAB 2: Bank Disbursement Details */}
          <TabsContent value="bank" className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
              <div className="border-b border-slate-100 pb-4 mb-5">
                <h3 className="text-base font-bold text-slate-900">
                  Bank Disbursement & Wire Transfer Details
                </h3>
                <p className="text-xs text-slate-500">
                  These bank coordinates appear directly in the payment section of generated invoices and payment instructions.
                </p>
              </div>

              <form onSubmit={handleSaveBank} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="bank-name" className="text-xs font-semibold text-slate-700">
                      Bank Name <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="bank-name"
                      placeholder="e.g. Sohar International Bank"
                      value={bankForm.bankName}
                      onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                      required
                      className="text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="bank-branch" className="text-xs font-semibold text-slate-700">
                      Branch Name
                    </Label>
                    <Input
                      id="bank-branch"
                      placeholder="Falaj Al Qabail, Sohar Branch"
                      value={bankForm.branch}
                      onChange={(e) => setBankForm({ ...bankForm, branch: e.target.value })}
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="bank-holder" className="text-xs font-semibold text-slate-700">
                      Beneficiary Account Name
                    </Label>
                    <Input
                      id="bank-holder"
                      value={bankForm.companyName}
                      onChange={(e) => setBankForm({ ...bankForm, companyName: e.target.value })}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="bank-acc" className="text-xs font-semibold text-slate-700">
                      Account Number <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="bank-acc"
                      value={bankForm.accountNumber}
                      onChange={(e) =>
                        setBankForm({ ...bankForm, accountNumber: e.target.value })
                      }
                      required
                      className="text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="bank-iban" className="text-xs font-semibold text-slate-700">
                      International Bank Account Number (IBAN) <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="bank-iban"
                      value={bankForm.iban}
                      onChange={(e) => setBankForm({ ...bankForm, iban: e.target.value })}
                      required
                      className="text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="bank-swift" className="text-xs font-semibold text-slate-700">
                      SWIFT / BIC Code
                    </Label>
                    <Input
                      id="bank-swift"
                      value={bankForm.swiftCode}
                      onChange={(e) => setBankForm({ ...bankForm, swiftCode: e.target.value })}
                      className="text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Bank Preview Box */}
                <div className="mt-4 rounded-lg bg-amber-50/60 border border-amber-200 p-4 text-xs">
                  <span className="font-bold text-amber-900 block mb-2">
                    Live Invoice Footer Disbursement Preview:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                    <div>
                      <span className="text-slate-500">Bank:</span>{" "}
                      <span className="font-semibold">{bankForm.bankName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Account No:</span>{" "}
                      <span className="font-mono font-bold text-slate-900">
                        {bankForm.accountNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Account Name:</span>{" "}
                      <span>{bankForm.companyName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">SWIFT:</span>{" "}
                      <span className="font-mono">{bankForm.swiftCode}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-500">IBAN:</span>{" "}
                      <span className="font-mono font-semibold text-amber-900">
                        {bankForm.iban}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold gap-1.5 shadow-xs"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Bank Details</span>
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>

          {/* TAB 3: Assets, Letterhead & Seal Management */}
          <TabsContent value="assets" className="space-y-6">
            {/* Global Master Stamp & Signature Switches */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900">
                  Document Stamp & Signature Master Controls
                </h3>
                <p className="text-xs text-slate-500">
                  Centralized document stamping controls. Turn on or off the official seal and authorized signature for generated invoices and PDFs.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Shield className="h-4 w-4 text-amber-700" />
                      Display Official C.R. 1000156 Round Seal
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Renders the purple/blue official Golden Hornet LLC round stamp on invoice documents.
                    </p>
                  </div>
                  <Switch
                    checked={assetToggles.enableStamp}
                    onCheckedChange={handleToggleStamp}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <FileCheck className="h-4 w-4 text-emerald-700" />
                      Display Official Authorized Signature
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Renders the authorized executive signature next to the Golden Hornet designation block.
                    </p>
                  </div>
                  <Switch
                    checked={assetToggles.enableSignature}
                    onCheckedChange={handleToggleSignature}
                  />
                </div>
              </div>
            </div>

            {/* Asset Files Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Asset 1: Company Logo */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b pb-3 mb-3">
                    <div className="font-bold text-xs text-slate-900">Official Company Logo</div>
                    <span className="text-[10px] text-slate-400">PNG / WebP / SVG</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-4">
                    Primary Golden Hornet LLC emblem used on the web header, navigation, and summary cards.
                  </p>
                  <div className="h-28 w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center p-3 relative overflow-hidden">
                    <Image
                      src={assets.logoUrl}
                      alt="Company Logo Preview"
                      width={120}
                      height={80}
                      className="object-contain max-h-24"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between gap-2">
                  <input
                    type="file"
                    ref={logoInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleFileUpload(e, "logoUrl", "LOGO_CHANGED", "Company logo")
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => logoInputRef.current?.click()}
                    className="text-xs font-medium gap-1.5"
                  >
                    <UploadCloud className="h-3.5 w-3.5 text-slate-500" />
                    <span>Upload New</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleResetAsset("logoUrl", "/images/logo.png", "Company Logo")
                    }
                    className="text-[11px] text-slate-500 hover:text-rose-600"
                  >
                    Reset
                  </Button>
                </div>
              </div>

              {/* Asset 2: Official Letterhead Template */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b pb-3 mb-3">
                    <div className="font-bold text-xs text-slate-900">
                      Official Golden Hornet Letterhead Background
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">A4 (2480x3508)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-4">
                    The supplied graphic template containing top header graphics and footer contact banner. Used as the exact invoice PDF background.
                  </p>
                  <div className="h-28 w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center p-2 relative overflow-hidden">
                    <Image
                      src={assets.letterheadUrl}
                      alt="Letterhead Preview"
                      width={90}
                      height={120}
                      className="object-contain max-h-24 shadow-xs"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between gap-2">
                  <input
                    type="file"
                    ref={letterheadInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleFileUpload(
                        e,
                        "letterheadUrl",
                        "LETTERHEAD_CHANGED",
                        "Official letterhead template"
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => letterheadInputRef.current?.click()}
                    className="text-xs font-medium gap-1.5"
                  >
                    <UploadCloud className="h-3.5 w-3.5 text-slate-500" />
                    <span>Replace Letterhead</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleResetAsset(
                        "letterheadUrl",
                        "/images/letter_head.png",
                        "Official Letterhead Template"
                      )
                    }
                    className="text-[11px] text-slate-500 hover:text-rose-600"
                  >
                    Reset
                  </Button>
                </div>
              </div>

              {/* Asset 3: Official Stamp (Round Seal) */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b pb-3 mb-3">
                    <div className="font-bold text-xs text-slate-900">
                      Official Round Seal (C.R. 1000156)
                    </div>
                    <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      Legal Seal
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-4">
                    High-resolution transparent seal showing the bilingual Golden Hornet stamp and Sultanate of Oman commercial registration.
                  </p>
                  <div className="h-28 w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center p-3 relative overflow-hidden">
                    <Image
                      src={assets.stampUrl}
                      alt="Company Stamp Preview"
                      width={100}
                      height={100}
                      className="object-contain max-h-24"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between gap-2">
                  <input
                    type="file"
                    ref={stampInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleFileUpload(e, "stampUrl", "STAMP_CHANGED", "Official company stamp")
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => stampInputRef.current?.click()}
                    className="text-xs font-medium gap-1.5"
                  >
                    <UploadCloud className="h-3.5 w-3.5 text-slate-500" />
                    <span>Upload Stamp</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleResetAsset("stampUrl", "/images/stamp.png", "Official Stamp")
                    }
                    className="text-[11px] text-slate-500 hover:text-rose-600"
                  >
                    Reset
                  </Button>
                </div>
              </div>

              {/* Asset 4: Authorized Sign */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b pb-3 mb-3">
                    <div className="font-bold text-xs text-slate-900">Authorized Signature</div>
                    <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Executive Sign
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-4">
                    Digital executive sign-off placed above &quot;Golden Hornet LLC / Authorized Signatory&quot;.
                  </p>
                  <div className="h-28 w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center p-3 relative overflow-hidden">
                    <Image
                      src={assets.signatureUrl}
                      alt="Authorized Signature Preview"
                      width={140}
                      height={70}
                      className="object-contain max-h-24"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between gap-2">
                  <input
                    type="file"
                    ref={signatureInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleFileUpload(
                        e,
                        "signatureUrl",
                        "SIGNATURE_CHANGED",
                        "Authorized signature"
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => signatureInputRef.current?.click()}
                    className="text-xs font-medium gap-1.5"
                  >
                    <UploadCloud className="h-3.5 w-3.5 text-slate-500" />
                    <span>Upload Signature</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleResetAsset(
                        "signatureUrl",
                        "/images/signature.png",
                        "Authorized Signature"
                      )
                    }
                    className="text-[11px] text-slate-500 hover:text-rose-600"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: Sequential Numbering & VAT Configuration */}
          <TabsContent value="numbering" className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
              <div className="border-b border-slate-100 pb-4 mb-5">
                <h3 className="text-base font-bold text-slate-900">
                  Sequential Numbering & Financial Settings
                </h3>
                <p className="text-xs text-slate-500">
                  Configure automatic invoice sequence numbering format, default VAT percentage, and default payment terms.
                </p>
              </div>

              <form onSubmit={handleSaveInvoiceConfig} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="conf-seq"
                      className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                    >
                      <span>Starting Sequence Number</span>
                      <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
                    </Label>
                    <Input
                      id="conf-seq"
                      type="number"
                      value={invoiceConfigForm.startingInvoiceSequence}
                      onChange={(e) =>
                        setInvoiceConfigForm({
                          ...invoiceConfigForm,
                          startingInvoiceSequence: Number(e.target.value),
                        })
                      }
                      className="text-xs font-mono font-bold"
                    />
                    <span className="text-[10px] text-slate-400">
                      Standard Golden Hornet series starts at 1250.
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="conf-fmt" className="text-xs font-semibold text-slate-700">
                      Numbering Format Template
                    </Label>
                    <Input
                      id="conf-fmt"
                      value={invoiceConfigForm.invoiceFormat}
                      onChange={(e) =>
                        setInvoiceConfigForm({
                          ...invoiceConfigForm,
                          invoiceFormat: e.target.value,
                        })
                      }
                      className="text-xs font-mono"
                    />
                    <span className="text-[10px] text-slate-400">
                      Available tokens: &#123;seq&#125;, &#123;year&#125; (e.g., 1250-2026)
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="conf-vat" className="text-xs font-semibold text-slate-700">
                      Default VAT Rate (%)
                    </Label>
                    <div className="relative">
                      <Input
                        id="conf-vat"
                        type="number"
                        step="0.1"
                        value={invoiceConfigForm.defaultVatRate}
                        onChange={(e) =>
                          setInvoiceConfigForm({
                            ...invoiceConfigForm,
                            defaultVatRate: Number(e.target.value),
                          })
                        }
                        className="text-xs font-mono font-bold pr-7"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                        %
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Sultanate of Oman statutory standard rate is 5.0%.
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="conf-terms" className="text-xs font-semibold text-slate-700">
                    Default Payment Terms
                  </Label>
                  <Textarea
                    id="conf-terms"
                    rows={2}
                    value={invoiceConfigForm.paymentTerms}
                    onChange={(e) =>
                      setInvoiceConfigForm({
                        ...invoiceConfigForm,
                        paymentTerms: e.target.value,
                      })
                    }
                    className="text-xs"
                  />
                  <span className="text-[10px] text-slate-400">
                    Will be pre-populated into new invoices (e.g. &quot;30 Days After Submission of the invoice.&quot;)
                  </span>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold gap-1.5 shadow-xs"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Numbering & VAT Configuration</span>
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
