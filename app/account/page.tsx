"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

type DailyRecord = {
  id: string
  applianceId: string
  applianceName: string
  power: number
  hours: number
  date: string
}

type MonthReport = {
  month: string
  monthNumber: number
  year: number
  totalConsumption: number
  totalCost: number
  recordsCount: number
}

export default function AccountPage() {
  const { user, logout, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [activeSection, setActiveSection] = useState<"profile" | "reports">("profile")
  const [selectedMonth, setSelectedMonth] = useState<MonthReport | null>(null)
  const [reportPeriod, setReportPeriod] = useState<"daily" | "weekly" | "monthly">("monthly")

  const [name, setName] = useState("")
  const [emailOrPhone, setEmailOrPhone] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [profileImage, setProfileImage] = useState<string>("/diverse-user-avatars.png")

  // Data states
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>([])
  const [tariff, setTariff] = useState(0.85)
  const [monthlyReports, setMonthlyReports] = useState<MonthReport[]>([])

  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmailOrPhone(user.email)

      // Load data from localStorage
      const storedRecords = localStorage.getItem("ecoEnergy_records")
      const storedTariff = localStorage.getItem("ecoEnergy_tariff")
      const storedProfileImage = localStorage.getItem("ecoEnergy_profileImage")

      if (storedRecords) setDailyRecords(JSON.parse(storedRecords))
      if (storedTariff) setTariff(Number.parseFloat(storedTariff))
      if (storedProfileImage) setProfileImage(storedProfileImage)
    }
  }, [user])

  useEffect(() => {
    // Calculate monthly reports
    const reports: MonthReport[] = []
    const currentYear = new Date().getFullYear()

    for (let i = 0; i < 12; i++) {
      const monthRecords = dailyRecords.filter((record) => {
        const recordDate = new Date(record.date)
        return recordDate.getMonth() === i && recordDate.getFullYear() === currentYear
      })

      const totalConsumption = monthRecords.reduce((total, record) => {
        return total + (record.power * record.hours) / 1000
      }, 0)

      reports.push({
        month: months[i],
        monthNumber: i,
        year: currentYear,
        totalConsumption,
        totalCost: totalConsumption * tariff,
        recordsCount: monthRecords.length,
      })
    }

    setMonthlyReports(reports)
  }, [dailyRecords, tariff])

  const getFilteredRecordsForMonth = (monthNumber: number) => {
    const currentYear = new Date().getFullYear()
    const monthRecords = dailyRecords.filter((record) => {
      const recordDate = new Date(record.date)
      return recordDate.getMonth() === monthNumber && recordDate.getFullYear() === currentYear
    })

    if (reportPeriod === "daily") {
      // Group by day
      const dailyGroups: { [key: string]: DailyRecord[] } = {}
      monthRecords.forEach((record) => {
        if (!dailyGroups[record.date]) {
          dailyGroups[record.date] = []
        }
        dailyGroups[record.date].push(record)
      })
      return dailyGroups
    }

    if (reportPeriod === "weekly") {
      // Group by week
      const weeklyGroups: { [key: string]: DailyRecord[] } = {}
      monthRecords.forEach((record) => {
        const recordDate = new Date(record.date)
        const weekNumber = Math.ceil(recordDate.getDate() / 7)
        const weekKey = `Semana ${weekNumber}`
        if (!weeklyGroups[weekKey]) {
          weeklyGroups[weekKey] = []
        }
        weeklyGroups[weekKey].push(record)
      })
      return weeklyGroups
    }

    // Monthly - return all records
    return { "Mês Completo": monthRecords }
  }

  const calculateGroupConsumption = (records: DailyRecord[]) => {
    const consumption = records.reduce((total, record) => {
      return total + (record.power * record.hours) / 1000
    }, 0)
    return {
      consumption,
      cost: consumption * tariff,
    }
  }

  const handleProfileUpdate = () => {
    if (name) {
      localStorage.setItem("ecoEnergy_name", name)
    }
    if (emailOrPhone) {
      localStorage.setItem("ecoEnergy_emailOrPhone", emailOrPhone)
    }
    alert("Perfil atualizado com sucesso!")
  }

  const handlePasswordChange = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Preencha todos os campos de senha")
      return
    }
    if (newPassword !== confirmPassword) {
      alert("As senhas não coincidem")
      return
    }
    if (newPassword.length < 6) {
      alert("A nova senha deve ter pelo menos 6 caracteres")
      return
    }
    // In a real app, this would call an API
    alert("Senha alterada com sucesso!")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type === "image/gif") {
        alert("Arquivos GIF não são permitidos. Use apenas JPG ou PNG.")
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setProfileImage(result)
        localStorage.setItem("ecoEnergy_profileImage", result)
      }
      reader.readAsDataURL(file)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            <button onClick={() => router.push("/")} className="flex items-center space-x-2">
              <svg
                className="w-6 h-6 md:w-8 md:h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-xl md:text-2xl font-bold text-green-600">EcoEnergy</span>
            </button>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-700 hidden sm:inline">Olá, {user.name.split(" ")[0]}</span>
              <button
                onClick={logout}
                className="text-sm bg-red-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-red-700 transition"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-base md:text-4xl font-bold text-gray-900 mb-8">Minha Conta</h1>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => {
              setActiveSection("profile")
              setSelectedMonth(null)
            }}
            className={`px-6 py-3 font-semibold transition border-b-2 ${
              activeSection === "profile"
                ? "text-green-600 border-green-600"
                : "text-gray-600 border-transparent hover:text-green-600"
            }`}
          >
            <span className="text-base">Perfil</span>
          </button>
          <button
            onClick={() => {
              setActiveSection("reports")
              setSelectedMonth(null)
            }}
            className={`px-6 py-3 font-semibold transition border-b-2 ${
              activeSection === "reports"
                ? "text-green-600 border-green-600"
                : "text-gray-600 border-transparent hover:text-green-600"
            }`}
          >
            <span className="text-base">Relatórios Mensais</span>
          </button>
        </div>

        {/* Profile Section */}
        {activeSection === "profile" && (
          <div className="space-y-8">
            {/* Profile Image */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Foto de Perfil</h2>
              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                <img
                  src={profileImage || "/placeholder.svg"}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-green-600"
                />
                <div>
                  <label
                    htmlFor="profileImageUpload"
                    className="cursor-pointer bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition inline-block"
                  >
                    Alterar Foto
                  </label>
                  <input
                    id="profileImageUpload"
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Informações Pessoais</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-700 mb-2">
                    Email ou Telefone
                  </label>
                  <input
                    type="text"
                    id="emailOrPhone"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="seu@email.com ou (00) 00000-0000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                  />
                </div>
                <button
                  onClick={handleProfileUpdate}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Alterar Senha</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Senha Atual
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                  />
                </div>
                <button
                  onClick={handlePasswordChange}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  Alterar Senha
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reports Section */}
        {activeSection === "reports" && !selectedMonth && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Relatórios Mensais de {new Date().getFullYear()}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {monthlyReports.map((report) => (
                <button
                  key={report.monthNumber}
                  onClick={() => setSelectedMonth(report)}
                  className="bg-green-50 rounded-lg p-6 hover:bg-green-100 transition text-left border border-gray-200 hover:border-green-400"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{report.month}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <strong>Consumo:</strong> {report.totalConsumption.toFixed(2)} kWh
                    </p>
                    <p>
                      <strong>Custo:</strong> R$ {report.totalCost.toFixed(2)}
                    </p>
                    <p>
                      <strong>Registros:</strong> {report.recordsCount}
                    </p>
                  </div>
                  {report.recordsCount === 0 && <p className="text-xs text-gray-400 mt-2">Sem registros neste mês</p>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Month Report */}
        {activeSection === "reports" && selectedMonth && (
          <div className="space-y-6">
            <button
              onClick={() => setSelectedMonth(null)}
              className="flex items-center text-green-600 hover:text-green-700 font-semibold"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar aos Meses
            </button>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedMonth.month} {selectedMonth.year}
              </h2>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Consumo Total</p>
                  <p className="text-2xl font-bold text-green-600">{selectedMonth.totalConsumption.toFixed(2)} kWh</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Custo Total</p>
                  <p className="text-2xl font-bold text-green-600">R$ {selectedMonth.totalCost.toFixed(2)}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Registros</p>
                  <p className="text-2xl font-bold text-green-600">{selectedMonth.recordsCount}</p>
                </div>
              </div>

              {selectedMonth.recordsCount > 0 && (
                <>
                  <div className="flex justify-center space-x-4 mb-6">
                    <button
                      onClick={() => setReportPeriod("daily")}
                      className={`px-6 py-2 rounded-lg font-semibold transition ${
                        reportPeriod === "daily"
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Diário
                    </button>
                    <button
                      onClick={() => setReportPeriod("weekly")}
                      className={`px-6 py-2 rounded-lg font-semibold transition ${
                        reportPeriod === "weekly"
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Semanal
                    </button>
                    <button
                      onClick={() => setReportPeriod("monthly")}
                      className={`px-6 py-2 rounded-lg font-semibold transition ${
                        reportPeriod === "monthly"
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Mensal
                    </button>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(getFilteredRecordsForMonth(selectedMonth.monthNumber)).map(([period, records]) => {
                      const { consumption, cost } = calculateGroupConsumption(records)
                      return (
                        <div key={period} className="bg-gray-50 rounded-lg p-4">
                          <h3 className="font-bold text-gray-900 mb-2">{period}</h3>
                          <div className="grid md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-sm text-gray-600">Consumo</p>
                              <p className="text-lg font-semibold text-green-600">{consumption.toFixed(2)} kWh</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Custo</p>
                              <p className="text-lg font-semibold text-green-600">R$ {cost.toFixed(2)}</p>
                            </div>
                          </div>
                          <details className="text-sm">
                            <summary className="cursor-pointer text-green-600 hover:text-green-700 font-semibold">
                              Ver detalhes ({records.length} registros)
                            </summary>
                            <div className="mt-2 space-y-1 pl-4">
                              {records.map((record) => (
                                <p key={record.id} className="text-gray-600">
                                  {record.date} - {record.applianceName}: {record.hours}h ({record.power}W)
                                </p>
                              ))}
                            </div>
                          </details>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {selectedMonth.recordsCount === 0 && (
                <div className="text-center text-gray-500 py-8">Nenhum registro encontrado para este mês.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
