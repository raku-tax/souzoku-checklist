import { useState, useEffect } from 'react'
import { Lock, RefreshCw, Users, CheckCircle, AlertCircle, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react'

const API_URL = "https://script.google.com/macros/s/AKfycbyqPL0rAgeCp9Uuj2STuP55jmb-XBn5U19Hr3oy-jOEz-hzM7hwv0b_uP1toYUN5ULD/exec"
const ADMIN_PASSWORD = "raku2024"

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [clients, setClients] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [expandedClient, setExpandedClient] = useState(null)
  const [clientDetails, setClientDetails] = useState({})

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setError('')
      loadClients()
    } else {
      setError('パスワードが正しくありません')
    }
  }

  const loadClients = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'getAll' })
      })
      const data = await response.json()
      if (data.success) {
        setClients(data.clients || [])
      }
    } catch (e) {
      console.error('Load error:', e)
    } finally {
      setIsLoading(false)
    }
  }

  const loadClientDetails = async (lineId) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'getDetails', lineId })
      })
      const data = await response.json()
      if (data.success) {
        setClientDetails(prev => ({ ...prev, [lineId]: data.details || [] }))
      }
    } catch (e) {
      console.error('Detail load error:', e)
    }
  }

  const toggleClient = (lineId) => {
    if (expandedClient === lineId) {
      setExpandedClient(null)
    } else {
      setExpandedClient(lineId)
      if (!clientDetails[lineId]) {
        loadClientDetails(lineId)
      }
    }
  }

  const getProgressColor = (progress) => {
    const p = parseInt(progress)
    if (p === 100) return 'bg-green-500'
    if (p >= 70) return 'bg-blue-500'
    if (p >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getStatusBadge = (progress) => {
    const p = parseInt(progress)
    if (p === 100) return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">完了</span>
    if (p >= 70) return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">順調</span>
    if (p >= 40) return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">進行中</span>
    return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">要フォロー</span>
  }

  // ログイン画面
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-gray-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">進捗管理</h1>
            <p className="text-sm text-gray-500 mt-1">パスワードを入力してください</p>
          </div>
          
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワード"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              className="w-full bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors"
            >
              ログイン
            </button>
          </form>
        </div>
      </div>
    )
  }

  // 管理画面
  const stats = {
    total: clients.length,
    complete: clients.filter(c => parseInt(c.progress) === 100).length,
    needsFollow: clients.filter(c => parseInt(c.progress) < 40).length
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-gray-800">📊 進捗管理</h1>
            <p className="text-xs text-gray-500">相続チェックリスト</p>
          </div>
          <button
            onClick={loadClients}
            disabled={isLoading}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <Users className="w-5 h-5 mx-auto text-blue-500 mb-1" />
          <p className="text-xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-xs text-gray-500">全案件</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <CheckCircle className="w-5 h-5 mx-auto text-green-500 mb-1" />
          <p className="text-xl font-bold text-green-600">{stats.complete}</p>
          <p className="text-xs text-gray-500">完了</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <AlertCircle className="w-5 h-5 mx-auto text-red-500 mb-1" />
          <p className="text-xl font-bold text-red-600">{stats.needsFollow}</p>
          <p className="text-xs text-gray-500">要フォロー</p>
        </div>
      </div>

      {/* Client List */}
      <div className="px-4 pb-6 space-y-3">
        {isLoading && clients.length === 0 ? (
          <div className="text-center py-8 text-gray-500">読み込み中...</div>
        ) : clients.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            まだデータがありません
          </div>
        ) : (
          clients.map((client) => (
            <div key={client.lineId} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div
                onClick={() => toggleClient(client.lineId)}
                className="p-4 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="mr-3">
                      <p className="font-bold text-gray-800">{client.name}</p>
                      <p className="text-xs text-gray-500">{client.lastUpdate}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {getStatusBadge(client.progress)}
                    {expandedClient === client.lineId ? (
                      <ChevronUp className="w-5 h-5 text-gray-400 ml-2" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 ml-2" />
                    )}
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex-1 mr-3">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${getProgressColor(client.progress)}`}
                        style={{ width: client.progress }}
                      />
                    </div>
                  </div>
                  <span className="text-lg font-bold text-gray-800">{client.progress}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{client.completed} / {client.total} 項目完了</p>
              </div>

              {/* Detail Section */}
              {expandedClient === client.lineId && (
                <div className="border-t border-gray-100 bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">📋 チェック状況</p>
                  {clientDetails[client.lineId] ? (
                    <div className="space-y-2">
                      {clientDetails[client.lineId].map((item, idx) => (
                        <div key={idx} className="flex items-center text-sm">
                          {item.checked === 'TRUE' ? (
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          ) : (
                            <div className="w-4 h-4 border-2 border-gray-300 rounded-full mr-2" />
                          )}
                          <span className={item.checked === 'TRUE' ? 'text-gray-400 line-through' : 'text-gray-700'}>
                            {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">読み込み中...</p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
