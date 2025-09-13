

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Settings, BarChart, Barcode, Mail, MessageSquare, KeyRound, Check, Globe, Copyright, Phone, MapPin, Clock, Pencil, Languages, Wallet, Info, FileText as FileTextIcon, Database, Palette, Facebook, Twitter, Instagram, Youtube, Image as ImageIcon, Trash2, Eye } from "lucide-react";
import React, { useEffect, useState, useRef } from 'react';
import { getReportSettings, saveReportSettings, ReportSettings, saveEmailSettings, getEmailSettings, EmailSettings, getDbSettings, saveDbSettings, testDbConnection, DbSettings, getGeneralSettings, saveGeneralSettings, GeneralSettings, getWhatsappSettings, saveWhatsappSettings, WhatsappSettings } from "@/services/settingsService";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const WhatsappIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle h-5 w-5 mr-2"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
);

const initialReportSettings: ReportSettings = {
    showHeader: true, showPatientAvatar: true, showFooter: true, showSignature: true, showQr: true,
    marginTop: "", marginRight: "", marginBottom: "", marginLeft: "", contentMarginTop: "",
    contentMarginBg: "", qrcodeDimension: "", headerAlign: "center", headerBorderColor: "",
    headerBorderWidth: 1, headerBgColor: "",
    branchName: { color: "", font: "", size: "" },
    branchInfo: { color: "", font: "", size: "" },
    patientTitle: { color: "", font: "", size: "" },
    patientData: { color: "", font: "", size: "" },
    testTitle: { color: "", font: "", size: "" },
    testName: { color: "", font: "", size: "" }
};

const initialEmailSettings: EmailSettings = {
    host: '', port: 0, username: '', password: '', encryption: 'ssl', fromAddress: '',
    fromName: '', headerColor: '', footerColor: '',
    patientCode: { active: true, subject: '', body: '' },
    resetPassword: { active: false, subject: '', body: '' },
    receipt: { active: false, subject: '', body: '' },
    report: { active: false, subject: '', body: '' },
};

const initialGeneralSettings: GeneralSettings = {
    labName: '', currency: '', timezone: '', language: 'es', location: '',
    phone: '', email: '', website: '', rights: '',
    facebook: '', twitter: '', instagram: '', youtube: '',
    reportLogoUrl: '', mainLogoUrl: ''
};

interface LogoInputProps {
    label: string;
    imageUrl: string | undefined;
    onFileSelect: (file: File | null) => void;
}

function LogoInput({ label, imageUrl, onFileSelect }: LogoInputProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string>("");

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            onFileSelect(file);
        } else {
            setFileName("");
            onFileSelect(null);
        }
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex items-center gap-2">
                <Input
                    readOnly
                    value={fileName || "Sin archivos seleccionados"}
                    className="flex-1 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>Browse</Button>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button type="button" variant="outline" size="icon" disabled={!imageUrl}>
                            <Eye className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    {imageUrl && (
                        <DialogContent>
                            <DialogHeader><DialogTitle>Vista Previa del Logo</DialogTitle></DialogHeader>
                            <div className="flex justify-center p-4">
                                <Image src={imageUrl} alt="Vista previa del logo" width={200} height={200} className="object-contain" />
                            </div>
                        </DialogContent>
                    )}
                </Dialog>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/png, image/jpeg, image/gif"
                    onChange={handleFileChange}
                />
            </div>
        </div>
    );
}


export default function SettingsPage() {
    const { t, setLanguage, language } = useTranslation();
    const [activeTab, setActiveTab] = React.useState("general");
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);

    const [generalSettings, setGeneralSettings] = useState<GeneralSettings>(initialGeneralSettings);
    const [reportSettings, setReportSettings] = useState<ReportSettings>(initialReportSettings);
    const [emailSettings, setEmailSettings] = useState<EmailSettings>(initialEmailSettings);
    const [dbSettings, setDbSettings] = useState<DbSettings>({
        host: '', port: 3306, database: '', user: '', password: '', ssl: false,
    });
    const [whatsappSettings, setWhatsappSettings] = useState<WhatsappSettings>({
        receiptLink: { active: true, message: '' },
        reportLink: { active: false, message: '' },
    });

    useEffect(() => {
        const loadSettings = async () => {
            setLoading(true);
            try {
                const [general, reports, emails, db, whatsapp] = await Promise.all([
                    getGeneralSettings(),
                    getReportSettings(),
                    getEmailSettings(),
                    getDbSettings(),
                    getWhatsappSettings(),
                ]);
                
                if (general) {
                    setGeneralSettings(prev => ({ ...prev, ...general }));
                     if (general.language && (general.language === 'es' || general.language === 'en')) {
                        setLanguage(general.language);
                    }
                }
                if (reports) {
                    setReportSettings(prev => ({ ...initialReportSettings, ...reports }));
                } else {
                    setReportSettings(initialReportSettings);
                }
                if (emails) {
                    setEmailSettings(prev => ({...initialEmailSettings, ...emails}));
                } else {
                    setEmailSettings(initialEmailSettings);
                }
                if (db) setDbSettings(db);
                if (whatsapp) setWhatsappSettings(prev => ({...prev, ...whatsapp}));
            } catch (error) {
                console.error("Error loading settings:", error);
                toast({ title: "Error", description: "No se pudieron cargar las configuraciones.", variant: "destructive"});
            } finally {
                setLoading(false);
            }
        };
        loadSettings();
    }, []);
    
    const handleGeneralSettingChange = (field: keyof GeneralSettings, value: string) => {
        setGeneralSettings(prev => ({ ...prev, [field]: value }));
        if (field === 'language' && (value === 'es' || value === 'en')) {
            setLanguage(value);
        }
    };

    const handleLogoSelect = (field: 'reportLogoUrl' | 'mainLogoUrl', file: File | null) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setGeneralSettings(prev => ({ ...prev, [field]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        } else {
            setGeneralSettings(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleReportSettingChange = (field: keyof ReportSettings, value: any) => {
        setReportSettings(prev => ({ ...prev, [field]: value }));
    };
    
    const handleEmailSettingChange = (field: keyof EmailSettings, value: any) => {
        setEmailSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleDbSettingChange = (field: keyof DbSettings, value: string | number | boolean) => {
        setDbSettings(prev => ({...prev, [field]: value}));
    };

    const handleEmailTemplateChange = (template: keyof Omit<EmailSettings, 'host' | 'port' | 'username' | 'password' | 'encryption' | 'fromAddress' | 'fromName' | 'headerColor' | 'footerColor'>, field: 'active' | 'subject' | 'body', value: any) => {
        setEmailSettings(prev => ({
            ...prev,
            [template]: {
                ...(prev[template] as object),
                [field]: value
            }
        }));
    };

    const handleWhatsappTemplateChange = (template: keyof WhatsappSettings, field: 'active' | 'message', value: any) => {
        setWhatsappSettings(prev => ({
            ...prev,
            [template]: {
                ...(prev[template] as object),
                [field]: value
            }
        }));
    };


    const handleFontSettingChange = (section: keyof ReportSettings, field: 'color' | 'font' | 'size', value: any) => {
        setReportSettings(prev => ({
            ...prev,
            [section]: {
                ...(prev[section] as object),
                [field]: value
            }
        }));
    };

    const handleSaveGeneralSettings = async () => {
        try {
            await saveGeneralSettings(generalSettings);
            toast({
                title: t('settings.toast.success_title'),
                description: t('settings.toast.general_saved_success'),
            });
        } catch (error) {
            console.error("Error saving general settings:", error);
            toast({
                title: t('settings.toast.error_title'),
                description: t('settings.toast.general_saved_error'),
                variant: "destructive",
            });
        }
    };

    const handleSaveReportSettings = async () => {
        try {
            await saveReportSettings(reportSettings);
            toast({
                title: "Éxito",
                description: "La configuración de informes se ha guardado correctamente.",
            });
        } catch (error) {
            console.error("Error saving report settings:", error);
            toast({
                title: "Error",
                description: "No se pudo guardar la configuración de informes.",
                variant: "destructive",
            });
        }
    };
    
    const handleSaveEmailSettings = async () => {
        try {
            await saveEmailSettings(emailSettings);
            toast({
                title: "Éxito",
                description: "La configuración de correo se ha guardado correctamente.",
            });
        } catch (error) {
            console.error("Error saving email settings:", error);
            toast({
                title: "Error",
                description: "No se pudo guardar la configuración de correo.",
                variant: "destructive",
            });
        }
    };

    const handleSaveDbSettings = async () => {
        try {
            await saveDbSettings(dbSettings);
            toast({
                title: "Éxito",
                description: "La configuración de la base de datos se ha guardado.",
            });
        } catch (error) {
            console.error("Error saving database settings:", error);
            toast({
                title: "Error",
                description: "No se pudo guardar la configuración de la base de datos.",
                variant: "destructive",
            });
        }
    };

    const handleSaveWhatsappSettings = async () => {
        try {
            await saveWhatsappSettings(whatsappSettings);
            toast({
                title: "Éxito",
                description: "La configuración de WhatsApp se ha guardado correctamente.",
            });
        } catch (error) {
            console.error("Error saving WhatsApp settings:", error);
            toast({
                title: "Error",
                description: "No se pudo guardar la configuración de WhatsApp.",
                variant: "destructive",
            });
        }
    };

    const handleTestDbConnection = async () => {
        try {
            const result = await testDbConnection(dbSettings);
            if (result.success) {
                toast({
                    title: "Conexión Exitosa",
                    description: "La conexión con la base de datos se ha establecido correctamente.",
                });
            } else {
                 toast({
                    title: "Error de Conexión",
                    description: result.error || "Ocurrió un error desconocido.",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            toast({
                title: "Error de Conexión",
                description: error.message || "Ocurrió un error al intentar conectar.",
                variant: "destructive",
            });
        }
    };

    const renderLoadingSkeleton = () => (
      <div className="space-y-6">
        <div className="space-y-2">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
        </div>
        <div className="text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">{t('breadcrumbs.home')}</Link> / {t('breadcrumbs.settings')}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 h-fit">
            <CardContent className="p-2">
                <nav className="flex flex-col gap-1">
                    <Button variant={activeTab === 'general' ? 'default' : 'ghost'} onClick={() => setActiveTab('general')} className="justify-start px-3">
                        <Settings className="h-5 w-5 mr-2" /> {t('settings.tabs.general')}
                    </Button>
                    <Button variant={activeTab === 'database' ? 'default' : 'ghost'} onClick={() => setActiveTab('database')} className="justify-start px-3">
                        <Database className="h-5 w-5 mr-2" /> {t('settings.tabs.database')}
                    </Button>
                    <Button variant={activeTab === 'report-design' ? 'default' : 'ghost'} onClick={() => setActiveTab('report-design')} className="justify-start px-3">
                        <Palette className="h-5 w-5 mr-2" /> {t('settings.tabs.report_design')}
                    </Button>
                    <Button variant={activeTab === 'templates' ? 'default' : 'ghost'} asChild className="justify-start px-3">
                        <Link href="/configuraciones/plantillas">
                            <FileTextIcon className="h-5 w-5 mr-2" /> {t('settings.tabs.report_templates')}
                        </Link>
                    </Button>
                    <Button variant={activeTab === 'barcode' ? 'default' : 'ghost'} onClick={() => setActiveTab('barcode')} className="justify-start px-3">
                        <Barcode className="h-5 w-5 mr-2" /> {t('settings.tabs.barcode')}
                    </Button>
                    <Button variant={activeTab === 'emails' ? 'default' : 'ghost'} onClick={() => setActiveTab('emails')} className="justify-start px-3">
                        <Mail className="h-5 w-5 mr-2" /> {t('settings.tabs.emails')}
                    </Button>
                     <Button variant={activeTab === 'sms' ? 'default' : 'ghost'} onClick={() => setActiveTab('sms')} className="justify-start px-3">
                        <MessageSquare className="h-5 w-5 mr-2" /> {t('settings.tabs.sms')}
                    </Button>
                    <Button variant={activeTab === 'whatsapp' ? 'default' : 'ghost'} onClick={() => setActiveTab('whatsapp')} className="justify-start px-3">
                        <WhatsappIcon /> {t('settings.tabs.whatsapp')}
                    </Button>
                    <Button variant={activeTab === 'apikeys' ? 'default' : 'ghost'} onClick={() => setActiveTab('apikeys')} className="justify-start px-3">
                        <KeyRound className="h-5 w-5 mr-2" /> {t('settings.tabs.api_keys')}
                    </Button>
                </nav>
            </CardContent>
        </Card>
        <div className="lg:col-span-3">
          {loading ? (
             <Card><CardHeader><CardTitle>Cargando...</CardTitle></CardHeader><CardContent>{renderLoadingSkeleton()}</CardContent></Card>
          ) : (
            <>
              <div className={activeTab === 'general' ? '' : 'hidden'}>
                  <Card>
                      <CardHeader>
                          <CardTitle>{t('settings.general.title')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <Tabs defaultValue="general">
                              <TabsList>
                                  <TabsTrigger value="general">{t('settings.general.tabs.general')}</TabsTrigger>
                                  <TabsTrigger value="social">{t('settings.general.tabs.social')}</TabsTrigger>
                                  <TabsTrigger value="images">{t('settings.general.tabs.images')}</TabsTrigger>
                              </TabsList>
                              <TabsContent value="general" className="pt-6">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="space-y-2">
                                          <Label htmlFor="lab-name">{t('settings.general.lab_name')}</Label>
                                          <div className="flex items-center border rounded-md">
                                              <span className="px-3 text-muted-foreground"><Pencil className="h-5 w-5"/></span>
                                              <Input id="lab-name" value={generalSettings.labName} onChange={(e) => handleGeneralSettingChange('labName', e.target.value)} className="border-0 focus-visible:ring-0" />
                                          </div>
                                      </div>
                                      <div className="space-y-2">
                                          <Label htmlFor="currency">{t('settings.general.currency')}</Label>
                                          <div className="flex items-center border rounded-md">
                                               <span className="px-3 text-muted-foreground"><Wallet className="h-5 w-5"/></span>
                                              <Select value={generalSettings.currency} onValueChange={(v) => handleGeneralSettingChange('currency', v)}>
                                                  <SelectTrigger id="currency" className="border-0 focus:ring-0">
                                                      <SelectValue placeholder={t('settings.general.select_currency')} />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                      <SelectItem value="MXN">{t('settings.general.currency_mxn')}</SelectItem>
                                                      <SelectItem value="USD">{t('settings.general.currency_usd')}</SelectItem>
                                                  </SelectContent>
                                              </Select>
                                          </div>
                                      </div>
                                      <div className="space-y-2">
                                          <Label htmlFor="timezone">{t('settings.general.timezone')}</Label>
                                          <div className="flex items-center border rounded-md">
                                              <span className="px-3 text-muted-foreground"><Clock className="h-5 w-5"/></span>
                                              <Select value={generalSettings.timezone} onValueChange={(v) => handleGeneralSettingChange('timezone', v)}>
                                                  <SelectTrigger id="timezone" className="border-0 focus:ring-0">
                                                      <SelectValue placeholder={t('settings.general.select_timezone')} />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                      <SelectItem value="mexico_city">(GMT-6:00) America/Mexico_City</SelectItem>
                                                  </SelectContent>
                                              </Select>
                                          </div>
                                      </div>
                                      <div className="space-y-2">
                                          <Label htmlFor="language">{t('settings.general.language')}</Label>
                                           <div className="flex items-center border rounded-md">
                                              <span className="px-3 text-muted-foreground"><Languages className="h-5 w-5"/></span>
                                              <Select value={generalSettings.language} onValueChange={(v) => handleGeneralSettingChange('language', v)}>
                                                  <SelectTrigger id="language" className="border-0 focus:ring-0">
                                                      <SelectValue placeholder={t('settings.general.select_language')} />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                      <SelectItem value="es">{t('settings.general.language_es')}</SelectItem>
                                                      <SelectItem value="en">{t('settings.general.language_en')}</SelectItem>
                                                  </SelectContent>
                                              </Select>
                                          </div>
                                      </div>
                                      <div className="space-y-2">
                                          <Label htmlFor="location">{t('settings.general.location')}</Label>
                                          <div className="flex items-center border rounded-md">
                                              <span className="px-3 text-muted-foreground"><MapPin className="h-5 w-5"/></span>
                                              <Input id="location" value={generalSettings.location} onChange={(e) => handleGeneralSettingChange('location', e.target.value)} className="border-0 focus-visible:ring-0" />
                                          </div>
                                      </div>
                                      <div className="space-y-2">
                                          <Label htmlFor="phone">{t('settings.general.phone')}</Label>
                                          <div className="flex items-center border rounded-md">
                                              <span className="px-3 text-muted-foreground"><Phone className="h-5 w-5"/></span>
                                              <Input id="phone" value={generalSettings.phone} onChange={(e) => handleGeneralSettingChange('phone', e.target.value)} className="border-0 focus-visible:ring-0" />
                                          </div>
                                      </div>
                                      <div className="space-y-2">
                                          <Label htmlFor="email">{t('settings.general.email')}</Label>
                                          <div className="flex items-center border rounded-md">
                                              <span className="px-3 text-muted-foreground"><Mail className="h-5 w-5"/></span>
                                              <Input id="email" type="email" value={generalSettings.email} onChange={(e) => handleGeneralSettingChange('email', e.target.value)} className="border-0 focus-visible:ring-0" />
                                          </div>
                                      </div>
                                      <div className="space-y-2">
                                          <Label htmlFor="website">{t('settings.general.website')}</Label>
                                          <div className="flex items-center border rounded-md">
                                              <span className="px-3 text-muted-foreground"><Globe className="h-5 w-5"/></span>
                                              <Input id="website" value={generalSettings.website} onChange={(e) => handleGeneralSettingChange('website', e.target.value)} className="border-0 focus-visible:ring-0" />
                                          </div>
                                      </div>
                                      <div className="space-y-2 md:col-span-2">
                                          <Label htmlFor="rights">{t('settings.general.rights')}</Label>
                                           <div className="flex items-center border rounded-md">
                                              <span className="px-3 text-muted-foreground"><Copyright className="h-5 w-5"/></span>
                                              <Input id="rights" value={generalSettings.rights} onChange={(e) => handleGeneralSettingChange('rights', e.target.value)} className="border-0 focus-visible:ring-0" />
                                          </div>
                                      </div>
                                  </div>
                              </TabsContent>
                              <TabsContent value="social" className="pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="facebook">Facebook</Label>
                                        <div className="flex items-center border rounded-md">
                                            <span className="p-2 bg-muted rounded-l-md"><Facebook className="h-5 w-5 text-blue-600"/></span>
                                            <Input id="facebook" placeholder="https://facebook.com" value={generalSettings.facebook || ''} onChange={(e) => handleGeneralSettingChange('facebook', e.target.value)} className="border-0 focus-visible:ring-0" />
                                        </div>
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="twitter">Twitter</Label>
                                        <div className="flex items-center border rounded-md">
                                            <span className="p-2 bg-muted rounded-l-md"><Twitter className="h-5 w-5 text-sky-500"/></span>
                                            <Input id="twitter" placeholder="https://twitter.com" value={generalSettings.twitter || ''} onChange={(e) => handleGeneralSettingChange('twitter', e.target.value)} className="border-0 focus-visible:ring-0" />
                                        </div>
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="instagram">Instagram</Label>
                                        <div className="flex items-center border rounded-md">
                                            <span className="p-2 bg-muted rounded-l-md"><Instagram className="h-5 w-5 text-pink-500"/></span>
                                            <Input id="instagram" placeholder="https://instagram.com" value={generalSettings.instagram || ''} onChange={(e) => handleGeneralSettingChange('instagram', e.target.value)} className="border-0 focus-visible:ring-0" />
                                        </div>
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="youtube">Youtube</Label>
                                        <div className="flex items-center border rounded-md">
                                            <span className="p-2 bg-muted rounded-l-md"><Youtube className="h-5 w-5 text-red-600"/></span>
                                            <Input id="youtube" placeholder="https://youtube.com" value={generalSettings.youtube || ''} onChange={(e) => handleGeneralSettingChange('youtube', e.target.value)} className="border-0 focus-visible:ring-0" />
                                        </div>
                                    </div>
                                </div>
                              </TabsContent>
                              <TabsContent value="images" className="pt-6 space-y-6">
                                <LogoInput 
                                    label="Elija el logotipo del informe [100 X 100]"
                                    imageUrl={generalSettings.reportLogoUrl}
                                    onFileSelect={(file) => handleLogoSelect('reportLogoUrl', file)}
                                />
                                <LogoInput 
                                    label="Elija Logo [100 X 100]"
                                    imageUrl={generalSettings.mainLogoUrl}
                                    onFileSelect={(file) => handleLogoSelect('mainLogoUrl', file)}
                                />
                              </TabsContent>
                          </Tabs>
                      </CardContent>
                      <div className="flex justify-start p-6 pt-0">
                          <Button onClick={handleSaveGeneralSettings}>
                              <Check className="mr-2"/> {t('settings.buttons.save')}
                          </Button>
                      </div>
                  </Card>
              </div>
              
              <div className={activeTab === 'database' ? '' : 'hidden'}>
                  <Card>
                      <CardHeader>
                          <CardTitle>Configuración de Base de Datos</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                  <Label htmlFor="host">Host</Label>
                                  <Input id="host" value={dbSettings.host} onChange={(e) => handleDbSettingChange('host', e.target.value)} />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="port">Puerto</Label>
                                  <Input id="port" type="number" value={dbSettings.port} onChange={(e) => handleDbSettingChange('port', parseInt(e.target.value) || 3306)} />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="database">Nombre de la Base de Datos</Label>
                                  <Input id="database" value={dbSettings.database} onChange={(e) => handleDbSettingChange('database', e.target.value)} />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="user">Usuario</Label>
                                  <Input id="user" value={dbSettings.user} onChange={(e) => handleDbSettingChange('user', e.target.value)} />
                              </div>
                               <div className="space-y-2">
                                  <Label htmlFor="password">Contraseña</Label>
                                  <Input id="password" type="password" value={dbSettings.password} onChange={(e) => handleDbSettingChange('password', e.target.value)} />
                              </div>
                               <div className="flex items-center space-x-2">
                                  <Switch id="ssl" checked={dbSettings.ssl} onCheckedChange={(checked) => handleDbSettingChange('ssl', checked)} />
                                  <Label htmlFor="ssl">Usar Conexión Segura (SSL)</Label>
                              </div>
                          </div>
                      </CardContent>
                      <div className="flex justify-start p-6 pt-0 gap-4">
                          <Button onClick={handleSaveDbSettings}>
                              <Check className="mr-2"/> Guardar
                          </Button>
                          <Button onClick={handleTestDbConnection} variant="outline">
                              Probar Conexión
                          </Button>
                      </div>
                  </Card>
              </div>
              
              <div className={activeTab === 'report-design' ? '' : 'hidden'}>
                  <Card>
                      <CardHeader>
                          <CardTitle>Configuración de Diseño de Informes</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-8">
                          <div className="space-y-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="flex items-center gap-2">
                                      <Switch id="show-header" checked={reportSettings.showHeader} onCheckedChange={(c) => handleReportSettingChange('showHeader', c)} />
                                      <Label htmlFor="show-header">Mostrar Encabezado</Label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                      <Switch id="show-patient-avatar" checked={reportSettings.showPatientAvatar} onCheckedChange={(c) => handleReportSettingChange('showPatientAvatar', c)} />
                                      <Label htmlFor="show-patient-avatar">Mostrar avatar del paciente</Label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                      <Switch id="show-footer" checked={reportSettings.showFooter} onCheckedChange={(c) => handleReportSettingChange('showFooter', c)} />
                                      <Label htmlFor="show-footer">Mostrar pie de página</Label>
                                  </div>
                                   <div className="flex items-center gap-2">
                                      <Switch id="show-signature" checked={reportSettings.showSignature} onCheckedChange={(c) => handleReportSettingChange('showSignature', c)} />
                                      <Label htmlFor="show-signature">Mostrar firma</Label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                      <Switch id="show-qr" checked={reportSettings.showQr} onCheckedChange={(c) => handleReportSettingChange('showQr', c)} />
                                      <Label htmlFor="show-qr">Mostrar código QR</Label>
                                  </div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-end">
                                  <div className="space-y-2">
                                      <Label htmlFor="margin-top">Margen superior</Label>
                                      <Input id="margin-top" value={reportSettings.marginTop} onChange={(e) => handleReportSettingChange('marginTop', e.target.value)} />
                                  </div>
                                  <div className="space-y-2">
                                      <Label htmlFor="margin-right">Margen derecho</Label>
                                      <Input id="margin-right" value={reportSettings.marginRight} onChange={(e) => handleReportSettingChange('marginRight', e.target.value)} />
                                  </div>
                                  <div className="space-y-2">
                                      <Label htmlFor="margin-bottom">Margen inferior</Label>
                                      <Input id="margin-bottom" value={reportSettings.marginBottom} onChange={(e) => handleReportSettingChange('marginBottom', e.target.value)} />
                                  </div>
                                  <div className="space-y-2">
                                      <Label htmlFor="margin-left">Margen a la izquierda</Label>
                                      <Input id="margin-left" value={reportSettings.marginLeft} onChange={(e) => handleReportSettingChange('marginLeft', e.target.value)} />
                                  </div>
                                   <div className="space-y-2">
                                      <Label htmlFor="content-margin-top">Margen de contenido superior</Label>
                                      <Input id="content-margin-top" value={reportSettings.contentMarginTop} onChange={(e) => handleReportSettingChange('contentMarginTop', e.target.value)} />
                                  </div>
                                  <div className="space-y-2">
                                      <Label htmlFor="content-margin-bg">Fondo del margen de contenido</Label>
                                      <Input id="content-margin-bg" value={reportSettings.contentMarginBg} onChange={(e) => handleReportSettingChange('contentMarginBg', e.target.value)} />
                                  </div>
                                  <div className="space-y-2">
                                      <Label htmlFor="qrcode-dimension">Dimensión de Qrcode</Label>
                                      <Input id="qrcode-dimension" value={reportSettings.qrcodeDimension} onChange={(e) => handleReportSettingChange('qrcodeDimension', e.target.value)} />
                                  </div>
                              </div>
                          </div>

                          <div className="space-y-4 pt-4 border-t">
                              <h3 className="font-semibold text-lg">Encabezamiento</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                  <div className="space-y-2">
                                      <Label htmlFor="align">Alinear</Label>
                                      <Select value={reportSettings.headerAlign} onValueChange={(v) => handleReportSettingChange('headerAlign', v)}>
                                          <SelectTrigger id="align"><SelectValue /></SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="left">Izquierda</SelectItem>
                                            <SelectItem value="center">Centrar</SelectItem>
                                            <SelectItem value="right">Derecha</SelectItem>
                                          </SelectContent>
                                      </Select>
                                  </div>
                                  <div className="space-y-2">
                                      <Label htmlFor="border-color">Color del borde</Label>
                                      <div className="flex items-center gap-2">
                                          <Input id="border-color" value={reportSettings.headerBorderColor} onChange={(e) => handleReportSettingChange('headerBorderColor', e.target.value)} />
                                          <div className="h-8 w-8 rounded-md border" style={{ backgroundColor: reportSettings.headerBorderColor }}></div>
                                      </div>
                                  </div>
                                  <div className="space-y-2">
                                      <Label htmlFor="border-width">Ancho del borde</Label>
                                      <Input id="border-width" value={reportSettings.headerBorderWidth} onChange={(e) => handleReportSettingChange('headerBorderWidth', Number(e.target.value))} type="number" />
                                  </div>
                                  <div className="space-y-2">
                                      <Label htmlFor="bg-color">Color de fondo</Label>
                                       <div className="flex items-center gap-2">
                                          <Input id="bg-color" value={reportSettings.headerBgColor} onChange={(e) => handleReportSettingChange('headerBgColor', e.target.value)} />
                                          <div className="h-8 w-8 rounded-md border" style={{ backgroundColor: reportSettings.headerBgColor }}></div>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-4 border-t">
                              <div className="space-y-4 p-4 rounded-md border">
                                   <h4 className="font-medium">Nombre de la sucursal</h4>
                                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div className="space-y-2">
                                          <Label>Color</Label>
                                          <Input type="color" value={reportSettings.branchName.color} onChange={(e) => handleFontSettingChange('branchName', 'color', e.target.value)} />
                                      </div>
                                      <div className="space-y-2">
                                          <Label>Tipo de fuente</Label>
                                          <Select value={reportSettings.branchName.font} onValueChange={(v) => handleFontSettingChange('branchName', 'font', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="sans-serif">sans-serif (Arabic)</SelectItem></SelectContent></Select>
                                      </div>
                                      <div className="space-y-2">
                                          <Label>Tamaño de fuente</Label>
                                          <Input value={reportSettings.branchName.size} onChange={(e) => handleFontSettingChange('branchName', 'size', e.target.value)} />
                                      </div>
                                   </div>
                              </div>
                               <div className="space-y-4 p-4 rounded-md border">
                                   <h4 className="font-medium">Información de sucursal</h4>
                                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div className="space-y-2">
                                          <Label>Color</Label>
                                          <Input type="color" value={reportSettings.branchInfo.color} onChange={(e) => handleFontSettingChange('branchInfo', 'color', e.target.value)} />
                                      </div>
                                      <div className="space-y-2">
                                          <Label>Tipo de fuente</Label>
                                          <Select value={reportSettings.branchInfo.font} onValueChange={(v) => handleFontSettingChange('branchInfo', 'font', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="sans-serif">sans-serif (Arabic)</SelectItem></SelectContent></Select>
                                      </div>
                                      <div className="space-y-2">
                                          <Label>Tamaño de fuente</Label>
                                          <Input value={reportSettings.branchInfo.size} onChange={(e) => handleFontSettingChange('branchInfo', 'size', e.target.value)} />
                                      </div>
                                   </div>
                              </div>
                               <div className="space-y-4 p-4 rounded-md border">
                                   <h4 className="font-medium">Título del paciente</h4>
                                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div className="space-y-2">
                                          <Label>Color</Label>
                                          <Input type="color" value={reportSettings.patientTitle.color} onChange={(e) => handleFontSettingChange('patientTitle', 'color', e.target.value)} />
                                      </div>
                                      <div className="space-y-2">
                                          <Label>Tipo de fuente</Label>
                                          <Select value={reportSettings.patientTitle.font} onValueChange={(v) => handleFontSettingChange('patientTitle', 'font', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="sans-serif">sans-serif (Arabic)</SelectItem></SelectContent></Select>
                                      </div>
                                      <div className="space-y-2">
                                          <Label>Tamaño de fuente</Label>
                                          <Input value={reportSettings.patientTitle.size} onChange={(e) => handleFontSettingChange('patientTitle', 'size', e.target.value)} />
                                      </div>
                                   </div>
                              </div>
                               <div className="space-y-4 p-4 rounded-md border">
                                   <h4 className="font-medium">Datos del paciente</h4>
                                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div className="space-y-2">
                                          <Label>Color</Label>
                                          <Input type="color" value={reportSettings.patientData.color} onChange={(e) => handleFontSettingChange('patientData', 'color', e.target.value)} />
                                      </div>
                                      <div className="space-y-2">
                                          <Label>Tipo de fuente</Label>
                                          <Select value={reportSettings.patientData.font} onValueChange={(v) => handleFontSettingChange('patientData', 'font', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="sans-serif">sans-serif (Arabic)</SelectItem></SelectContent></Select>
                                      </div>
                                      <div className="space-y-2">
                                          <Label>Tamaño de fuente</Label>
                                          <Input value={reportSettings.patientData.size} onChange={(e) => handleFontSettingChange('patientData', 'size', e.target.value)} />
                                      </div>
                                   </div>
                              </div>
                               <div className="space-y-4 p-4 rounded-md border">
                                   <h4 className="font-medium">Título de la prueba</h4>
                                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div className="space-y-2">
                                          <Label>Color</Label>
                                          <Input type="color" value={reportSettings.testTitle.color} onChange={(e) => handleFontSettingChange('testTitle', 'color', e.target.value)} />
                                      </div>
                                      <div className="space-y-2">
                                          <Label>Tipo de fuente</Label>
                                          <Select value={reportSettings.testTitle.font} onValueChange={(v) => handleFontSettingChange('testTitle', 'font', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="sans-serif">sans-serif (Arabic)</SelectItem></SelectContent></Select>
                                      </div>
                                      <div className="space-y-2">
                                          <Label>Tamaño de fuente</Label>
                                          <Input value={reportSettings.testTitle.size} onChange={(e) => handleFontSettingChange('testTitle', 'size', e.target.value)} />
                                      </div>
                                   </div>
                              </div>
                               <div className="space-y-4 p-4 rounded-md border">
                                   <h4 className="font-medium">Nombre de la prueba</h4>
                                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div className="space-y-2">
                                          <Label>Color</Label>
                                          <Input type="color" value={reportSettings.testName.color} onChange={(e) => handleFontSettingChange('testName', 'color', e.target.value)} />
                                      </div>
                                      <div className="space-y-2">
                                          <Label>Tipo de fuente</Label>
                                          <Select value={reportSettings.testName.font} onValueChange={(v) => handleFontSettingChange('testName', 'font', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="sans-serif">sans-serif (Arabic)</SelectItem></SelectContent></Select>
                                      </div>
                                      <div className="space-y-2">
                                          <Label>Tamaño de fuente</Label>
                                          <Input value={reportSettings.testName.size} onChange={(e) => handleFontSettingChange('testName', 'size', e.target.value)} />
                                      </div>
                                   </div>
                              </div>
                          </div>

                      </CardContent>
                      <div className="flex justify-start p-6 pt-0">
                          <Button onClick={handleSaveReportSettings}>
                              <Check className="mr-2"/> Guardar
                          </Button>
                      </div>
                  </Card>
              </div>
              <div className={activeTab === 'barcode' ? '' : 'hidden'}>
                  <Card>
                      <CardHeader>
                          <CardTitle>Código de Barras</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="space-y-2">
                                  <Label htmlFor="barcode-type">Tipo</Label>
                                  <Select defaultValue="C128B">
                                      <SelectTrigger id="barcode-type">
                                          <SelectValue placeholder="Seleccione el tipo" />
                                      </SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="QR">QR</SelectItem>
                                          <SelectItem value="CODE11">CODE11</SelectItem>
                                          <SelectItem value="I25+">I25+</SelectItem>
                                          <SelectItem value="C128">C128</SelectItem>
                                          <SelectItem value="C128A">C128A</SelectItem>
                                          <SelectItem value="C128B">C128B</SelectItem>
                                          <SelectItem value="C128C">C128C</SelectItem>
                                          <SelectItem value="EAN2">EAN2</SelectItem>
                                          <SelectItem value="EANS">EANS</SelectItem>
                                          <SelectItem value="EAN8">EAN8</SelectItem>
                                          <SelectItem value="EAN13">EAN13</SelectItem>
                                          <SelectItem value="UPCA">UPCA</SelectItem>
                                          <SelectItem value="UPCE">UPCE</SelectItem>
                                          <SelectItem value="MSI">MSI</SelectItem>
                                          <SelectItem value="MSI+">MSI+</SelectItem>
                                          <SelectItem value="POSTNET">POSTNET</SelectItem>
                                          <SelectItem value="PLANET">PLANET</SelectItem>
                                          <SelectItem value="RMS4CC">RMS4CC</SelectItem>
                                          <SelectItem value="KIX">KIX</SelectItem>
                                          <SelectItem value="IMB">IMB</SelectItem>
                                          <SelectItem value="CODABAR">CODABAR</SelectItem>
                                      </SelectContent>
                                  </Select>
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="barcode-width">Ancho</Label>
                                  <Input id="barcode-width" type="number" defaultValue="60" />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="barcode-height">Altura</Label>
                                  <Input id="barcode-height" type="number" defaultValue="150" />
                              </div>
                          </div>
                      </CardContent>
                       <div className="flex justify-start p-6 pt-0">
                          <Button>
                              <Check className="mr-2"/> Guardar
                          </Button>
                      </div>
                  </Card>
              </div>
               <div className={activeTab === 'emails' ? '' : 'hidden'}>
                  <Card>
                      <CardHeader>
                          <CardTitle>Configuración de Correo</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                             <div className="space-y-2">
                                  <Label htmlFor="email-host">Host</Label>
                                  <Input id="host" value={emailSettings.host} onChange={(e) => handleEmailSettingChange('host', e.target.value)} />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="email-port">Puerto</Label>
                                  <Input id="port" type="number" value={emailSettings.port} onChange={(e) => handleEmailSettingChange('port', parseInt(e.target.value) || 0)} />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="email-username">Usuario</Label>
                                  <Input id="username" value={emailSettings.username} onChange={(e) => handleEmailSettingChange('username', e.target.value)} />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="email-password">Contraseña</Label>
                                  <Input id="password" type="password" value={emailSettings.password} onChange={(e) => handleEmailSettingChange('password', e.target.value)} />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="email-encryption">Cifrado</Label>
                                   <Select value={emailSettings.encryption} onValueChange={(v) => handleEmailSettingChange('encryption', v)}>
                                      <SelectTrigger id="email-encryption">
                                          <SelectValue placeholder="Seleccionar cifrado" />
                                      </SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="ssl">SSL</SelectItem>
                                          <SelectItem value="tls">TLS</SelectItem>
                                      </SelectContent>
                                  </Select>
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="email-from-address">Dirección de envío</Label>
                                  <Input id="fromAddress" value={emailSettings.fromAddress} onChange={(e) => handleEmailSettingChange('fromAddress', e.target.value)} />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="email-from-name">Nombre de envío</Label>
                                  <Input id="fromName" value={emailSettings.fromName} onChange={(e) => handleEmailSettingChange('fromName', e.target.value)} />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="email-header-color">Color de cabecera</Label>
                                  <div className="flex items-center gap-2">
                                      <Input id="headerColor" value={emailSettings.headerColor} onChange={(e) => handleEmailSettingChange('headerColor', e.target.value)} />
                                      <div className="h-8 w-8 rounded-md border" style={{ backgroundColor: emailSettings.headerColor }}></div>
                                  </div>
                              </div>
                               <div className="space-y-2">
                                  <Label htmlFor="email-footer-color">Color de pie de página</Label>
                                  <div className="flex items-center gap-2">
                                      <Input id="footerColor" value={emailSettings.footerColor} onChange={(e) => handleEmailSettingChange('footerColor', e.target.value)} />
                                      <div className="h-8 w-8 rounded-md border" style={{ backgroundColor: emailSettings.footerColor }}></div>
                                  </div>
                              </div>
                          </div>

                          <Tabs defaultValue="patient-code" className="pt-6">
                              <TabsList>
                                  <TabsTrigger value="patient-code">Código de Paciente</TabsTrigger>
                                  <TabsTrigger value="reset-password">Restablecer Contraseña</TabsTrigger>
                                  <TabsTrigger value="receipt">Recibo</TabsTrigger>
                                  <TabsTrigger value="report">Informe</TabsTrigger>
                              </TabsList>
                              <TabsContent value="patient-code" className="pt-6">
                                  <div className="space-y-4">
                                      <div className="flex items-center gap-2">
                                          <Switch id="patient-code-active" checked={emailSettings.patientCode?.active} onCheckedChange={(c) => handleEmailTemplateChange('patientCode', 'active', c)} />
                                          <Label htmlFor="patient-code-active" className={emailSettings.patientCode?.active ? "text-green-600 font-bold" : "text-gray-500"}>
                                              {emailSettings.patientCode?.active ? 'Activo' : 'Inactivo'}
                                          </Label>
                                      </div>
                                      <div className="text-red-500 text-sm">
                                          <p>No cambiar las variables: {`{patient_code}`} {`{patient_name}`}</p>
                                      </div>
                                      <div className="space-y-2">
                                          <Label htmlFor="patient-code-subject">Asunto</Label>
                                          <Input id="patient-code-subject" value={emailSettings.patientCode?.subject} onChange={(e) => handleEmailTemplateChange('patientCode', 'subject', e.target.value)} />
                                      </div>
                                      <div className="space-y-2">
                                          <Label htmlFor="patient-code-body">Cuerpo del mensaje</Label>
                                          <Textarea id="patient-code-body" value={emailSettings.patientCode?.body} onChange={(e) => handleEmailTemplateChange('patientCode', 'body', e.target.value)} rows={4} />
                                      </div>
                                  </div>
                              </TabsContent>
                               <TabsContent value="reset-password">
                                  <p>Plantilla para restablecer contraseña aquí.</p>
                              </TabsContent>
                               <TabsContent value="receipt">
                                  <p>Plantilla para recibo aquí.</p>
                              </TabsContent>
                               <TabsContent value="report">
                                  <p>Plantilla para informe aquí.</p>
                              </TabsContent>
                          </Tabs>

                      </CardContent>
                       <div className="flex justify-start p-6 pt-0">
                          <Button onClick={handleSaveEmailSettings}>
                              <Check className="mr-2"/> Guardar
                          </Button>
                      </div>
                  </Card>
              </div>
              <div className={activeTab === 'sms' ? '' : 'hidden'}>
                   <Card>
                      <CardHeader>
                          <CardTitle>Configuración de SMS</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                          <div className="space-y-2">
                              <Label htmlFor="sms-gateway">Puerta de enlace activa</Label>
                              <Select defaultValue="nexmo">
                                  <SelectTrigger id="sms-gateway">
                                      <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="nexmo">Nexmo</SelectItem>
                                      <SelectItem value="twilio">Twilio</SelectItem>
                                      <SelectItem value="localtext">Local Text (Indian)</SelectItem>
                                      <SelectItem value="infobip">Infobip</SelectItem>
                                  </SelectContent>
                              </Select>
                          </div>
                          <Tabs defaultValue="nexmo" className="pt-2">
                              <TabsList>
                                  <TabsTrigger value="nexmo">Nexmo</TabsTrigger>
                                  <TabsTrigger value="twilio">Twilio</TabsTrigger>
                                  <TabsTrigger value="localtext">Local Text (Indian)</TabsTrigger>
                                  <TabsTrigger value="infobip">Infobip</TabsTrigger>
                              </TabsList>
                              <TabsContent value="nexmo" className="pt-6 space-y-4">
                                 <div className="bg-teal-100 border-l-4 border-teal-500 text-teal-700 p-4" role="alert">
                                      <p className="font-bold flex items-center gap-2"><Info className="h-5 w-5"/> Ir a nexmo: <a href="https://dashboard.nexmo.com" target="_blank" rel="noopener noreferrer" className="underline">https://dashboard.nexmo.com</a></p>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="space-y-2">
                                          <Label htmlFor="nexmo-api-key">API Key</Label>
                                          <Input id="nexmo-api-key" />
                                      </div>
                                      <div className="space-y-2">
                                          <Label htmlFor="nexmo-secret-key">Secret Key</Label>
                                          <Input id="nexmo-secret-key" />
                                      </div>
                                  </div>
                              </TabsContent>
                              <TabsContent value="twilio">
                                  <p>Configuración para Twilio aquí.</p>
                              </TabsContent>
                          </Tabs>

                          <Tabs defaultValue="patient-code-sms" className="pt-6">
                              <TabsList>
                                  <TabsTrigger value="patient-code-sms">Código del paciente</TabsTrigger>
                                  <TabsTrigger value="test-notification-sms">Notificación de pruebas</TabsTrigger>
                              </TabsList>
                              <TabsContent value="patient-code-sms" className="pt-6">
                                  <div className="space-y-4">
                                      <div className="flex items-center gap-2">
                                          <Switch id="sms-patient-code-inactive" />
                                          <Label htmlFor="sms-patient-code-inactive" className="text-gray-500">Inactivo</Label>
                                      </div>
                                      <div className="text-red-500 text-sm">
                                          <p>No cambie las variables:</p>
                                          <p>{`{patient_name}`}</p>
                                          <p>{`{patient_code}`}</p>
                                      </div>
                                      <div className="space-y-2">
                                          <Label htmlFor="sms-patient-code-body">Mensaje</Label>
                                          <Textarea id="sms-patient-code-body" defaultValue="welcome {patient_name}, your patient code is {patient_code}" rows={4} />
                                      </div>
                                  </div>
                              </TabsContent>
                              <TabsContent value="test-notification-sms">
                                  <p>Plantilla para notificación de pruebas aquí.</p>
                              </TabsContent>
                          </Tabs>

                      </CardContent>
                      <div className="flex justify-start p-6 pt-0">
                          <Button>
                              <Check className="mr-2"/> Guardar
                          </Button>
                      </div>
                  </Card>
              </div>
              <div className={activeTab === 'whatsapp' ? '' : 'hidden'}>
                  <Card>
                      <CardHeader>
                          <CardTitle>Configuración de Whatsapp</CardTitle>
                      </CardHeader>
                      <CardContent>
                          <Tabs defaultValue="receipt-link">
                              <TabsList>
                                  <TabsTrigger value="receipt-link">Enlace de recibo</TabsTrigger>
                                  <TabsTrigger value="report-link">Enlace de informe</TabsTrigger>
                              </TabsList>
                              <TabsContent value="receipt-link" className="pt-6">
                                  <div className="space-y-4">
                                      <div className="flex items-center gap-2">
                                          <Switch id="whatsapp-receipt-active" checked={whatsappSettings.receiptLink.active} onCheckedChange={(c) => handleWhatsappTemplateChange('receiptLink', 'active', c)} />
                                          <Label htmlFor="whatsapp-receipt-active" className={whatsappSettings.receiptLink.active ? "text-green-600 font-bold" : "text-gray-500"}>
                                              {whatsappSettings.receiptLink.active ? 'Activo' : 'Inactivo'}
                                          </Label>
                                      </div>
                                      <div className="text-red-500 text-sm">
                                          <p>No cambiar las variables: {`{patient_name}`} {`{receipt_link}`}</p>
                                      </div>
                                      <div className="space-y-2">
                                          <Label htmlFor="whatsapp-receipt-message">Mensaje</Label>
                                          <Textarea id="whatsapp-receipt-message" value={whatsappSettings.receiptLink.message} onChange={(e) => handleWhatsappTemplateChange('receiptLink', 'message', e.target.value)} rows={4} />
                                      </div>
                                  </div>
                              </TabsContent>
                               <TabsContent value="report-link" className="pt-6">
                                  <div className="space-y-4">
                                      <div className="flex items-center gap-2">
                                          <Switch id="whatsapp-report-active" checked={whatsappSettings.reportLink.active} onCheckedChange={(c) => handleWhatsappTemplateChange('reportLink', 'active', c)} />
                                          <Label htmlFor="whatsapp-report-active" className={whatsappSettings.reportLink.active ? "text-green-600 font-bold" : "text-gray-500"}>
                                              {whatsappSettings.reportLink.active ? 'Activo' : 'Inactivo'}
                                          </Label>
                                      </div>
                                      <div className="text-red-500 text-sm">
                                          <p>No cambiar las variables: {`{patient_name}`} {`{report_link}`}</p>
                                      </div>
                                      <div className="space-y-2">
                                          <Label htmlFor="whatsapp-report-message">Mensaje</Label>
                                          <Textarea id="whatsapp-report-message" value={whatsappSettings.reportLink.message} onChange={(e) => handleWhatsappTemplateChange('reportLink', 'message', e.target.value)} rows={4} />
                                      </div>
                                  </div>
                              </TabsContent>
                          </Tabs>
                      </CardContent>
                      <div className="flex justify-start p-6 pt-0">
                          <Button onClick={handleSaveWhatsappSettings}>
                              <Check className="mr-2"/> Guardar
                          </Button>
                      </div>
                  </Card>
              </div>
               <div className={activeTab === 'apikeys' ? '' : 'hidden'}>
                  <Card>
                      <CardHeader>
                          <CardTitle>Claves de API</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                          <div className="space-y-4">
                              <h3 className="font-semibold flex items-center gap-2"><MapPin className="h-5 w-5" /> Google Maps</h3>
                              <div className="bg-cyan-500 text-white p-3 rounded-md flex items-center gap-2 text-sm">
                                  <Info className="h-5 w-5" />
                                  <a href="#" className="underline">¿Cómo generar una clave de API de Google?</a>
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="google-map-key">Clave de API de Google Maps</Label>
                                  <Input id="google-map-key" placeholder="Ingrese su clave de API de Google Maps" />
                              </div>
                          </div>
                      </CardContent>
                      <div className="flex justify-start p-6 pt-0">
                          <Button>
                              <Check className="mr-2"/> Guardar
                          </Button>
                      </div>
                  </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

    
