"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

type SavedAppliance = {
  id: string
  name: string
  power: number
}

type DailyRecord = {
  id: string
  applianceId: string
  applianceName: string
  power: number
  hours: number
  date: string
}

export default function EcoEnergyPage() {
  const { user, logout, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [savedAppliances, setSavedAppliances] = useState<SavedAppliance[]>([])
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>([])
  const [tariff, setTariff] = useState(0.85)
  const [activeTab, setActiveTab] = useState<"register" | "appliances" | "report" | "timer">("appliances")
  const [reportPeriod, setReportPeriod] = useState<"daily" | "weekly" | "monthly">("monthly")

  // Estados para cadastro de aparelhos
  const [newApplianceName, setNewApplianceName] = useState("")
  const [newAppliancePower, setNewAppliancePower] = useState("")

  // Estados para registro diário
  const [selectedApplianceId, setSelectedApplianceId] = useState("")
  const [dailyHours, setDailyHours] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])

  const [timerApplianceId, setTimerApplianceId] = useState("")
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null)

  const getFilteredRecords = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (reportPeriod === "daily") {
      const todayStr = today.toISOString().split("T")[0]
      return dailyRecords.filter((record) => record.date === todayStr)
    }

    if (reportPeriod === "weekly") {
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)
      return dailyRecords.filter((record) => {
        const recordDate = new Date(record.date)
        return recordDate >= weekAgo && recordDate <= today
      })
    }

    // monthly - retorna todos os registros
    return dailyRecords
  }

  const totalConsumption = getFilteredRecords().reduce((total, record) => {
    return total + (record.power * record.hours) / 1000
  }, 0)

  const estimatedCost = totalConsumption * tariff

  const getPersonalizedTips = () => {
    if (totalConsumption === 0) {
      return {
        message: "Comece a registrar seu consumo para receber dicas personalizadas!",
        color: "blue",
      }
    }

    const periodText = reportPeriod === "daily" ? "hoje" : reportPeriod === "weekly" ? "esta semana" : "este mês"

    if (totalConsumption < 50) {
      return {
        message: `Parabéns! Seu consumo ${periodText} está abaixo da média. Continue assim e inspire outras pessoas!`,
        color: "green",
      }
    }

    if (totalConsumption < 150) {
      return {
        message: `Bom trabalho! Seu consumo ${periodText} está na média. Pequenas mudanças podem reduzir ainda mais sua conta.`,
        color: "green",
      }
    }

    if (totalConsumption < 300) {
      return {
        message: `Atenção! Seu consumo ${periodText} está acima da média. Revise seus hábitos e identifique os maiores consumidores.`,
        color: "yellow",
      }
    }

    return {
      message: `Alerta! Seu consumo ${periodText} está muito alto. É hora de tomar medidas urgentes para reduzir o desperdício de energia.`,
      color: "red",
    }
  }

  const personalizedTip = getPersonalizedTips()

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  useEffect(() => {
    const storedAppliances = localStorage.getItem("ecoEnergy_appliances")
    const storedRecords = localStorage.getItem("ecoEnergy_records")
    const storedTariff = localStorage.getItem("ecoEnergy_tariff")

    if (storedAppliances) setSavedAppliances(JSON.parse(storedAppliances))
    if (storedRecords) setDailyRecords(JSON.parse(storedRecords))
    if (storedTariff) setTariff(Number.parseFloat(storedTariff))
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isTimerRunning && timerStartTime) {
      interval = setInterval(() => {
        const now = Date.now()
        const elapsed = Math.floor((now - timerStartTime) / 1000)
        setElapsedSeconds(elapsed)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerRunning, timerStartTime])

  const saveAppliance = () => {
    if (newApplianceName && newAppliancePower) {
      const newAppliance: SavedAppliance = {
        id: Date.now().toString(),
        name: newApplianceName,
        power: Number.parseFloat(newAppliancePower),
      }
      const updated = [...savedAppliances, newAppliance]
      setSavedAppliances(updated)
      localStorage.setItem("ecoEnergy_appliances", JSON.stringify(updated))
      setNewApplianceName("")
      setNewAppliancePower("")
    }
  }

  const removeAppliance = (id: string) => {
    const updated = savedAppliances.filter((app) => app.id !== id)
    setSavedAppliances(updated)
    localStorage.setItem("ecoEnergy_appliances", JSON.stringify(updated))
  }

  const addDailyRecord = () => {
    if (selectedApplianceId && dailyHours && selectedDate) {
      const appliance = savedAppliances.find((app) => app.id === selectedApplianceId)
      if (appliance) {
        const newRecord: DailyRecord = {
          id: Date.now().toString(),
          applianceId: appliance.id,
          applianceName: appliance.name,
          power: appliance.power,
          hours: Number.parseFloat(dailyHours),
          date: selectedDate,
        }
        const updated = [...dailyRecords, newRecord]
        setDailyRecords(updated)
        localStorage.setItem("ecoEnergy_records", JSON.stringify(updated))
        setDailyHours("")
      }
    }
  }

  const removeRecord = (id: string) => {
    const updated = dailyRecords.filter((record) => record.id !== id)
    setDailyRecords(updated)
    localStorage.setItem("ecoEnergy_records", JSON.stringify(updated))
  }

  const updateTariff = (value: string) => {
    const newTariff = Number.parseFloat(value) || 0
    setTariff(newTariff)
    localStorage.setItem("ecoEnergy_tariff", newTariff.toString())
  }

  const startTimer = () => {
    if (timerApplianceId) {
      setIsTimerRunning(true)
      setTimerStartTime(Date.now())
      setElapsedSeconds(0)
    }
  }

  const stopTimer = () => {
    if (timerApplianceId && elapsedSeconds > 0) {
      const appliance = savedAppliances.find((app) => app.id === timerApplianceId)
      if (appliance) {
        // Converter segundos para horas (com 2 casas decimais)
        const hours = Number((elapsedSeconds / 3600).toFixed(2))
        const today = new Date().toISOString().split("T")[0]

        const newRecord: DailyRecord = {
          id: Date.now().toString(),
          applianceId: appliance.id,
          applianceName: appliance.name,
          power: appliance.power,
          hours: hours,
          date: today,
        }

        const updated = [...dailyRecords, newRecord]
        setDailyRecords(updated)
        localStorage.setItem("ecoEnergy_records", JSON.stringify(updated))
      }
    }

    // Reset timer
    setIsTimerRunning(false)
    setElapsedSeconds(0)
    setTimerStartTime(null)
    setTimerApplianceId("")
  }

  const resetTimer = () => {
    setIsTimerRunning(false)
    setElapsedSeconds(0)
    setTimerStartTime(null)
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
            <div className="flex items-center space-x-2">
              <svg
                className="w-6 h-6 md:w-8 md:h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-xl md:text-2xl font-bold text-green-600">EcoEnergy</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex space-x-8">
                <a href="#inicio" className="text-gray-700 hover:text-green-600 transition">
                  Início
                </a>
                <a href="#calculadora" className="text-gray-700 hover:text-green-600 transition">
                  Calculadora
                </a>
                <a href="#dicas" className="text-gray-700 hover:text-green-600 transition">
                  Dicas
                </a>
                <a href="#sobre" className="text-gray-700 hover:text-green-600 transition">
                  Sobre
                </a>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3">
                <button
                  onClick={() => router.push("/account")}
                  className="text-xs md:text-sm text-gray-700 hover:text-green-600 font-medium transition"
                >
                  Conta
                </button>
                <button
                  onClick={logout}
                  className="text-xs md:text-sm text-gray-700 hover:text-red-600 font-medium transition"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="inicio" className="py-12 md:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
            Economize Energia,
            <br />
            <span className="text-green-600">Salve o Planeta</span>
          </h1>
          <p className="text-base md:text-xl text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto">
            Descubra quanto você gasta com energia elétrica e aprenda a reduzir seu consumo de forma inteligente e
            sustentável.
          </p>
          <a
            href="#calculadora"
            className="inline-block bg-green-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-lg text-base md:text-lg font-semibold hover:bg-green-700 transition shadow-lg hover:shadow-xl"
          >
            Começar Agora
          </a>
        </div>
      </section>

      <section id="calculadora" className="py-12 md:py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold text-center text-gray-900 mb-3 md:mb-4">
            Sistema de Monitoramento
          </h2>
          <p className="text-sm md:text-base text-center text-gray-600 mb-6 md:mb-8">
            Cadastre seus aparelhos e registre o uso diário para acompanhar seu consumo
          </p>

          <div className="bg-blue-50 rounded-lg p-3 md:p-4 mb-6 md:mb-8 max-w-md mx-auto">
            <label htmlFor="tariff" className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
              Tarifa de Energia (R$/kWh)
            </label>
            <input
              type="number"
              id="tariff"
              value={tariff}
              onChange={(e) => updateTariff(e.target.value)}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm md:text-base"
            />
            <p className="text-xs text-gray-500 mt-1">Consulte sua conta de luz para saber o valor exato</p>
          </div>

          <div className="grid grid-cols-2 gap-2 md:flex md:justify-center md:space-x-4 mb-6 md:mb-8 max-w-md mx-auto">
            <button
              onClick={() => setActiveTab("appliances")}
              className={`px-3 py-2 md:px-6 md:py-3 rounded-lg text-sm md:text-base font-semibold transition ${
                activeTab === "appliances" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Aparelhos
            </button>
            <button
              onClick={() => setActiveTab("timer")}
              className={`px-3 py-2 md:px-6 md:py-3 rounded-lg text-sm md:text-base font-semibold transition ${
                activeTab === "timer" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Uso Rápido
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`px-3 py-2 md:px-6 md:py-3 rounded-lg text-sm md:text-base font-semibold transition ${
                activeTab === "register" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Registro
            </button>
            <button
              onClick={() => setActiveTab("report")}
              className={`px-3 py-2 md:px-6 md:py-3 rounded-lg text-sm md:text-base font-semibold transition ${
                activeTab === "report" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Relatório
            </button>
          </div>

          {activeTab === "appliances" && (
            <div className="bg-green-50 rounded-xl p-4 md:p-8 shadow-lg">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Cadastrar Aparelho</h3>

              <div className="grid md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="md:col-span-1">
                  <label htmlFor="applianceName" className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                    Nome do Aparelho
                  </label>
                  <input
                    type="text"
                    id="applianceName"
                    value={newApplianceName}
                    onChange={(e) => setNewApplianceName(e.target.value)}
                    placeholder="Ex: Geladeira"
                    className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm md:text-base"
                  />
                </div>

                <div className="md:col-span-1">
                  <label htmlFor="appliancePower" className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                    Potência (W)
                  </label>
                  <input
                    type="number"
                    id="appliancePower"
                    value={newAppliancePower}
                    onChange={(e) => setNewAppliancePower(e.target.value)}
                    placeholder="Ex: 150"
                    min="0"
                    className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm md:text-base"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={saveAppliance}
                    className="w-full bg-green-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg text-sm md:text-base font-semibold hover:bg-green-700 transition"
                  >
                    Salvar
                  </button>
                </div>
              </div>

              {savedAppliances.length > 0 && (
                <div>
                  <h4 className="text-sm md:text-base font-semibold text-gray-900 mb-3">Aparelhos Cadastrados:</h4>
                  <div className="space-y-2">
                    {savedAppliances.map((app) => (
                      <div key={app.id} className="flex justify-between items-center bg-white p-3 md:p-4 rounded-lg">
                        <span className="text-sm md:text-base text-gray-800">
                          <strong>{app.name}</strong> - {app.power}W
                        </span>
                        <button
                          onClick={() => removeAppliance(app.id)}
                          className="text-xs md:text-sm text-red-600 hover:text-red-800 font-semibold"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {savedAppliances.length === 0 && (
                <div className="text-center text-sm md:text-base text-gray-500 py-6 md:py-8">
                  Nenhum aparelho cadastrado ainda. Adicione seus aparelhos acima!
                </div>
              )}
            </div>
          )}

          {activeTab === "timer" && (
            <div className="bg-green-50 rounded-xl p-4 md:p-8 shadow-lg">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-4">Uso Rápido</h3>
              <p className="text-xs md:text-sm text-gray-600 mb-4 md:mb-6">
                Para aparelhos de uso rápido como secador, micro-ondas, liquidificador, etc.
              </p>

              {savedAppliances.length === 0 ? (
                <div className="text-center text-sm md:text-base text-gray-500 py-6 md:py-8">
                  Você precisa cadastrar aparelhos primeiro! Vá para a aba "Aparelhos".
                </div>
              ) : (
                <div className="max-w-md mx-auto">
                  {!isTimerRunning ? (
                    <>
                      <div className="mb-4 md:mb-6">
                        <label
                          htmlFor="timerAppliance"
                          className="block text-xs md:text-sm font-medium text-gray-700 mb-2"
                        >
                          Selecione o Aparelho
                        </label>
                        <select
                          id="timerAppliance"
                          value={timerApplianceId}
                          onChange={(e) => setTimerApplianceId(e.target.value)}
                          className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm md:text-base"
                        >
                          <option value="">Escolha um aparelho...</option>
                          {savedAppliances.map((app) => (
                            <option key={app.id} value={app.id}>
                              {app.name} ({app.power}W)
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={startTimer}
                        disabled={!timerApplianceId}
                        className="w-full bg-green-600 text-white px-6 py-4 md:px-8 md:py-5 rounded-lg text-base md:text-lg font-bold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg"
                      >
                        Iniciar Uso Rápido
                      </button>
                    </>
                  ) : (
                    <div className="text-center">
                      <div className="mb-4 md:mb-6">
                        <p className="text-sm md:text-base text-gray-700 mb-2">
                          <strong>{savedAppliances.find((app) => app.id === timerApplianceId)?.name}</strong>
                        </p>
                        <p className="text-xs md:text-sm text-gray-500">
                          {savedAppliances.find((app) => app.id === timerApplianceId)?.power}W
                        </p>
                      </div>

                      <div className="bg-white rounded-xl p-6 md:p-8 mb-4 md:mb-6 shadow-lg">
                        <div className="text-5xl md:text-7xl font-bold text-green-600 mb-2">
                          {formatTime(elapsedSeconds)}
                        </div>
                        <p className="text-xs md:text-sm text-gray-500">minutos:segundos</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 md:gap-4">
                        <button
                          onClick={resetTimer}
                          className="bg-yellow-500 text-white px-4 py-3 md:px-6 md:py-4 rounded-lg text-sm md:text-base font-semibold hover:bg-yellow-600 transition shadow-lg"
                        >
                          Reiniciar
                        </button>
                        <button
                          onClick={stopTimer}
                          className="bg-red-600 text-white px-4 py-3 md:px-6 md:py-4 rounded-lg text-sm md:text-base font-semibold hover:bg-red-700 transition shadow-lg"
                        >
                          Parar e Salvar
                        </button>
                      </div>

                      <p className="text-xs md:text-sm text-gray-500 mt-4 text-center">
                        O tempo será convertido automaticamente para horas e salvo no registro de hoje
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "register" && (
            <div className="bg-green-50 rounded-xl p-4 md:p-8 shadow-lg">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Registrar Uso Diário</h3>

              {savedAppliances.length === 0 ? (
                <div className="text-center text-sm md:text-base text-gray-500 py-6 md:py-8">
                  Você precisa cadastrar aparelhos primeiro! Vá para a aba "Aparelhos".
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
                    <div>
                      <label htmlFor="recordDate" className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                        Data
                      </label>
                      <input
                        type="date"
                        id="recordDate"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        max={new Date().toISOString().split("T")[0]}
                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm md:text-base"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="recordAppliance"
                        className="block text-xs md:text-sm font-medium text-gray-700 mb-2"
                      >
                        Aparelho
                      </label>
                      <select
                        id="recordAppliance"
                        value={selectedApplianceId}
                        onChange={(e) => setSelectedApplianceId(e.target.value)}
                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm md:text-base"
                      >
                        <option value="">Selecione...</option>
                        {savedAppliances.map((app) => (
                          <option key={app.id} value={app.id}>
                            {app.name} ({app.power}W)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="recordHours" className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                        Horas
                      </label>
                      <input
                        type="number"
                        id="recordHours"
                        value={dailyHours}
                        onChange={(e) => setDailyHours(e.target.value)}
                        placeholder="Ex: 8"
                        min="0"
                        step="0.5"
                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm md:text-base"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={addDailyRecord}
                        className="w-full bg-green-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg text-sm md:text-base font-semibold hover:bg-green-700 transition"
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>

                  {dailyRecords.length > 0 && (
                    <div>
                      <h4 className="text-sm md:text-base font-semibold text-gray-900 mb-3">Registros Recentes:</h4>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {dailyRecords
                          .slice()
                          .reverse()
                          .map((record) => (
                            <div
                              key={record.id}
                              className="flex justify-between items-center bg-white p-3 md:p-4 rounded-lg"
                            >
                              <span className="text-xs md:text-sm text-gray-800">
                                <strong>{record.date}</strong> - {record.applianceName} - {record.hours}h (
                                {record.power}
                                W)
                              </span>
                              <button
                                onClick={() => removeRecord(record.id)}
                                className="text-xs md:text-sm text-red-600 hover:text-red-800 font-semibold"
                              >
                                Remover
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "report" && (
            <div className="bg-green-50 rounded-xl p-4 md:p-8 shadow-lg">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Relatório de Consumo</h3>

              <div className="flex justify-center mb-6 md:mb-8 space-x-2 md:space-x-4">
                <button
                  onClick={() => setReportPeriod("daily")}
                  className={`px-3 py-2 md:px-6 md:py-3 rounded-lg text-sm md:text-base font-semibold transition ${
                    reportPeriod === "daily" ? "bg-green-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Diário
                </button>
                <button
                  onClick={() => setReportPeriod("weekly")}
                  className={`px-3 py-2 md:px-6 md:py-3 rounded-lg text-sm md:text-base font-semibold transition ${
                    reportPeriod === "weekly" ? "bg-green-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Semanal
                </button>
                <button
                  onClick={() => setReportPeriod("monthly")}
                  className={`px-3 py-2 md:px-6 md:py-3 rounded-lg text-sm md:text-base font-semibold transition ${
                    reportPeriod === "monthly" ? "bg-green-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Mensal
                </button>
              </div>

              {dailyRecords.length === 0 ? (
                <div className="text-center text-sm md:text-base text-gray-500 py-6 md:py-8">
                  Nenhum registro ainda. Comece a registrar seu uso diário!
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-8">
                    <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg text-center">
                      <div className="text-green-600 mb-3 md:mb-4">
                        <svg
                          className="w-12 h-12 md:w-16 md:h-16 mx-auto"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-2">Consumo Total</h3>
                      <p className="text-3xl md:text-5xl font-bold text-green-600">{totalConsumption.toFixed(2)}</p>
                      <p className="text-sm md:text-base text-gray-600 mt-2">kWh</p>
                      <p className="text-xs md:text-sm text-gray-500 mt-1">
                        Baseado em {getFilteredRecords().length} registros (
                        {reportPeriod === "daily" ? "hoje" : reportPeriod === "weekly" ? "últimos 7 dias" : "total"})
                      </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg text-center">
                      <div className="text-green-600 mb-3 md:mb-4">
                        <svg
                          className="w-12 h-12 md:w-16 md:h-16 mx-auto"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-2">Custo Estimado</h3>
                      <p className="text-3xl md:text-5xl font-bold text-green-600">R$ {estimatedCost.toFixed(2)}</p>
                      <p className="text-sm md:text-base text-gray-600 mt-2">
                        {reportPeriod === "daily" ? "Hoje" : reportPeriod === "weekly" ? "Esta Semana" : "Total"}
                      </p>
                      <p className="text-xs md:text-sm text-gray-500 mt-1">Tarifa: R$ {tariff.toFixed(2)}/kWh</p>
                    </div>
                  </div>

                  <div
                    className={`border-l-4 p-4 md:p-6 rounded-lg mb-4 md:mb-6 ${
                      personalizedTip.color === "green"
                        ? "bg-green-100 border-green-600"
                        : personalizedTip.color === "yellow"
                          ? "bg-yellow-100 border-yellow-600"
                          : personalizedTip.color === "red"
                            ? "bg-red-100 border-red-600"
                            : "bg-blue-100 border-blue-600"
                    }`}
                  >
                    <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 flex items-center">
                      <svg
                        className={`w-5 h-5 md:w-6 md:h-6 mr-2 ${
                          personalizedTip.color === "green"
                            ? "text-green-600"
                            : personalizedTip.color === "yellow"
                              ? "text-yellow-600"
                              : personalizedTip.color === "red"
                                ? "text-red-600"
                                : "text-blue-600"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                      Análise Personalizada
                    </h3>
                    <p className="text-sm md:text-base text-gray-700">{personalizedTip.message}</p>
                  </div>

                  <div className="bg-white rounded-lg p-4 md:p-6 shadow">
                    <h4 className="text-sm md:text-base font-bold text-gray-900 mb-3 md:mb-4">
                      Dicas para Economizar Mais:
                    </h4>
                    <ul className="space-y-2 text-xs md:text-sm text-gray-700">
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>Identifique os aparelhos que mais consomem e use-os com moderação</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>Desligue aparelhos da tomada quando não estiver usando (evite standby)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>Aproveite a luz natural durante o dia</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>Troque lâmpadas antigas por LED (economia de até 80%)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span>Reduza o tempo de banho em 2-3 minutos</span>
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Tips Section */}
      <section id="dicas" className="py-12 md:py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold text-center text-gray-900 mb-3 md:mb-4">Dicas de Economia</h2>
          <p className="text-sm md:text-base text-center text-gray-600 mb-8 md:mb-12">
            Pequenas mudanças que fazem grande diferença
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            <div className="bg-green-50 rounded-xl p-4 md:p-6 hover:shadow-lg transition">
              <div className="text-green-600 mb-3 md:mb-4">
                <svg className="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2">Troque para LED</h3>
              <p className="text-sm md:text-base lg:text-lg text-gray-600">
                Lâmpadas LED consomem até 80% menos energia que as incandescentes e duram muito mais.
              </p>
            </div>

            <div className="bg-green-50 rounded-xl p-4 md:p-6 hover:shadow-lg transition">
              <div className="text-green-600 mb-3 md:mb-4">
                <svg className="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2">Aproveite Luz Natural</h3>
              <p className="text-sm md:text-base lg:text-lg text-gray-600">
                Abra cortinas e janelas durante o dia. A luz natural é gratuita e faz bem à saúde.
              </p>
            </div>

            <div className="bg-green-50 rounded-xl p-4 md:p-6 hover:shadow-lg transition">
              <div className="text-green-600 mb-3 md:mb-4">
                <svg className="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2">Reduza o Banho</h3>
              <p className="text-sm md:text-base lg:text-lg text-gray-600">
                Diminua o tempo de banho em 2-3 minutos. O chuveiro elétrico é um dos maiores consumidores.
              </p>
            </div>

            <div className="bg-green-50 rounded-xl p-4 md:p-6 hover:shadow-lg transition">
              <div className="text-green-600 mb-3 md:mb-4">
                <svg className="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2">Desligue da Tomada</h3>
              <p className="text-sm md:text-base lg:text-lg text-gray-600">
                Aparelhos em standby consomem energia. Tire da tomada quando não estiver usando.
              </p>
            </div>

            <div className="bg-green-50 rounded-xl p-4 md:p-6 hover:shadow-lg transition">
              <div className="text-green-600 mb-3 md:mb-4">
                <svg className="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2">Geladeira Eficiente</h3>
              <p className="text-sm md:text-base lg:text-lg text-gray-600">
                Não abra a porta à toa, regule a temperatura corretamente e mantenha as borrachas em bom estado.
              </p>
            </div>

            <div className="bg-green-50 rounded-xl p-4 md:p-6 hover:shadow-lg transition">
              <div className="text-green-600 mb-3 md:mb-4">
                <svg className="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-2">Manutenção Regular</h3>
              <p className="text-sm md:text-base lg:text-lg text-gray-600">
                Limpe filtros de ar condicionado e verifique instalações elétricas regularmente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className="py-12 md:py-16 px-4 bg-green-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6">Sobre o EcoEnergy</h2>
          <p className="text-sm md:text-lg text-gray-600 mb-4 md:mb-6">
            O EcoEnergy é uma iniciativa educacional para conscientização sobre consumo energético sustentável. Nossa
            missão é ajudar pessoas a entenderem seu consumo de energia e adotarem práticas mais econômicas e
            ecológicas. Pequenas ações, quando somadas, têm o poder de fazer a diferença, e é com essa convicção que
            apresentamos o EcoEnergy como nossa contribuição para um mundo mais consciente do seu uso de recursos.
          </p>
          <p className="text-sm md:text-lg text-gray-600">
            Juntos, podemos fazer a diferença para um futuro mais sustentável! 🌱
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-600 text-white py-6 md:py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-3 md:mb-4">
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-xl md:text-2xl font-bold">EcoEnergy</span>
          </div>
          <p className="text-sm md:text-base text-green-50 mb-3 md:mb-4">Projeto de Conscientização Energética</p>
          <p className="text-xs md:text-sm text-green-100">
            © 2025 <strong>EETEPA Oriximiná</strong> - Todos os direitos reservados
          </p>
        </div>
      </footer>
    </div>
  )
}
