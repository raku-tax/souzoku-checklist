import { useState, useEffect } from 'react'
import liff from '@line/liff'
import { Check, ChevronDown, ChevronUp, FileText, User, Building, CreditCard, Shield, Receipt, MessageCircle, Loader2, Lock, RefreshCw, Users, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'

const LIFF_ID = "2008786355-AntIpNJL"
const API_URL = "https://script.google.com/macros/s/AKfycbyqPL0rAgeCp9Uuj2STuP55jmb-XBn5U19Hr3oy-jOEz-hzM7hwv0b_uP1toYUN5ULD/exec"
const ADMIN_PASSWORD = "raku2024"

const categories = [
  {
    id: 0, title: '亡くなられた方の書類', icon: 'FileText', color: 'bg-blue-500',
    items: [
      { id: 'a1', name: '戸籍謄本（出生〜死亡）', where: '本籍地の役場', hint: '複数の役場にまたがる場合があります' },
      { id: 'a2', name: '住民票の除票', where: '最後の住所地の役場', hint: '「本籍地記載」で取得してください' },
      { id: 'a3', name: '死亡診断書のコピー', where: 'お手元', hint: '' },
    ]
  },
  {
    id: 1, title: '相続人全員の書類', icon: 'User', color: 'bg-green-500',
    items: [
      { id: 'b1', name: '戸籍謄本', where: '本籍地の役場', hint: '' },
      { id: 'b2', name: '住民票（マイナンバー記載）', where: '住所地の役場', hint: 'コンビニでも取得可能' },
      { id: 'b3', name: '印鑑証明書', where: '住所地の役場', hint: '' },
      { id: 'b4', name: 'マイナンバーカードのコピー', where: 'お手元', hint: '両面コピー' },
      { id: 'b5', name: '身分証明書のコピー', where: 'お手元', hint: '運転免許証など' },
    ]
  },
  {
    id: 2, title: '不動産', icon: 'Building', color: 'bg-orange-500',
    items: [
      { id: 'c1', name: '固定資産税の納税通知書', where: 'お手元', hint: '毎年届くもの' },
      { id: 'c2', name: '登記簿謄本', where: '法務局', hint: 'オンラインでも取得可能' },
      { id: 'c3', name: '固定資産評価証明書', where: '市区町村役場', hint: '' },
      { id: 'c4', name: '公図・地積測量図', where: '法務局', hint: '' },
    ]
  },
  {
    id: 3, title: '預貯金・有価証券', icon: 'CreditCard', color: 'bg-purple-500',
    items: [
      { id: 'd1', name: '通帳コピー（過去5年分）', where: 'お手元', hint: '記帳してからコピーを' },
      { id: 'd2', name: '残高証明書（死亡日時点）', where: '各金融機関', hint: '「相続手続き」と伝えてください' },
      { id: 'd3', name: '証券会社の残高報告書', where: '証券会社', hint: '' },
    ]
  },
  {
    id: 4, title: '生命保険', icon: 'Shield', color: 'bg-pink-500',
    items: [
      { id: 'e1', name: '保険証券のコピー', where: 'お手元', hint: '' },
      { id: 'e2', name: '保険金支払通知書', where: '保険会社から届いたもの', hint: '' },
    ]
  },
  {
    id: 5, title: '債務・葬式費用', icon: 'Receipt', color: 'bg-red-500',
    items: [
      { id: 'f1', name: '借入金の残高証明書', where: '金融機関', hint: '' },
      { id: 'f2', name: '未払い医療費の領収書', where: 'お手元', hint: '' },
      { id: 'f3', name: '葬儀費用の領収書一式', where: 'お手元', hint: '' },
      { id: 'f4', name: 'お布施等の支払メモ', where: 'お手元', hint: '金額・日付・支払先' },
    ]
  },
]

const allItems = categories.flatMap(cat => cat.items)
const iconMap = { FileText, User, Building, CreditCard, Shield, Receipt }

// 管理画面コンポーネント
function AdminPage() {
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
            <button type="submit" className="w-full bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600">
              ログイン
            </button>
          </form>
        </div>
      </div>
    )
  }

  const stats = {
    total: clients.length,
    complete: clients.filter(c => parseInt(c.progress) === 100).length,
    needsFollow: clients.filter(c => parseInt(c.progress) < 40).length
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-gray-800">📊 進捗管理</h1>
            <p className="text-xs text-gray-500">相続チェックリスト</p>
          </div>
          <button onClick={loadClients} disabled={isLoading} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

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

      <div className="px-4 pb-6 space-y-3">
        {isLoading && clients.length === 0 ? (
          <div className="text-center py-8 text-gray-500">読み込み中...</div>
        ) : clients.length === 0 ? (
          <div className="text-center py-8 text-gray-500">まだデータがありません</div>
        ) : (
          clients.map((client) => (
            <div key={client.lineId} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div onClick={() => toggleClient(client.lineId)} className="p-4 cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-bold text-gray-800">{client.name}</p>
                    <p className="text-xs text-gray-500">{client.lastUpdate}</p>
                  </div>
                  <div className="flex items-center">
                    {getStatusBadge(client.progress)}
                    {expandedClient === client.lineId ? <ChevronUp className="w-5 h-5 text-gray-400 ml-2" /> : <ChevronDown className="w-5 h-5 text-gray-400 ml-2" />}
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-1 mr-3">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className={`h-2.5 rounded-full ${getProgressColor(client.progress)}`} style={{ width: client.progress }} />
                    </div>
                  </div>
                  <span className="text-lg font-bold text-gray-800">{client.progress}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{client.completed} / {client.total} 項目完了</p>
              </div>
              {expandedClient === client.lineId && (
                <div className="border-t border-gray-100 bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">📋 チェック状況</p>
                  {clientDetails[client.lineId] ? (
                    <div className="space-y-2">
                      {clientDetails[client.lineId].map((item, idx) => (
                        <div key={idx} className="flex items-center text-sm">
                          {item.checked === 'TRUE' ? <CheckCircle className="w-4 h-4 text-green-500 mr-2" /> : <div className="w-4 h-4 border-2 border-gray-300 rounded-full mr-2" />}
                          <span className={item.checked === 'TRUE' ? 'text-gray-400 line-through' : 'text-gray-700'}>{item.name}</span>
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

// お客様用チェックリストコンポーネント
function ChecklistPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [profile, setProfile] = useState(null)
  const [expandedCategory, setExpandedCategory] = useState(0)
  const [checkedItems, setCheckedItems] = useState({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => { initializeLiff() }, [])

  const initializeLiff = async () => {
    try {
      await liff.init({ liffId: LIFF_ID })
      if (liff.isLoggedIn()) {
        const userProfile = await liff.getProfile()
        setProfile(userProfile)
        await loadCheckedItems(userProfile.userId)
      } else {
        liff.login()
      }
    } catch (e) {
      setError('アプリの初期化に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const loadCheckedItems = async (userId) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'load', lineId: userId })
      })
      const data = await response.json()
      if (data.success && data.checkedItems) setCheckedItems(data.checkedItems)
    } catch (e) { console.error('Load error:', e) }
  }

  const saveCheckedItems = async (userId, userName, items) => {
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'save', lineId: userId, userName, checkedItems: items, allItems })
      })
    } catch (e) { console.error('Save error:', e) }
  }

  const toggleItem = async (itemId) => {
    if (!profile) return
    setIsSaving(true)
    const newItems = { ...checkedItems, [itemId]: !checkedItems[itemId] }
    setCheckedItems(newItems)
    await saveCheckedItems(profile.userId, profile.displayName, newItems)
    setIsSaving(false)
  }

  const sendMessage = () => {
    const url = 'https://line.me/R/ti/p/@521sbjrk'
    if (liff.isInClient()) liff.openWindow({ url, external: false })
    else window.open(url, '_blank')
  }

  const totalItems = categories.reduce((s, c) => s + c.items.length, 0)
  const checkedCount = Object.values(checkedItems).filter(Boolean).length
  const progress = Math.round((checkedCount / totalItems) * 100)
  const getCategoryProgress = (cat) => ({ checked: cat.items.filter(i => checkedItems[i.id]).length, total: cat.items.length })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-500 to-green-600 flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4"><FileText className="w-8 h-8 text-green-500" /></div>
        <h1 className="text-xl font-bold mb-2">相続税チェックリスト</h1>
        <Loader2 className="w-8 h-8 animate-spin mt-4" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 text-center shadow">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-green-500 text-white px-6 py-2 rounded-lg">再読み込み</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-green-500 text-white">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                {profile?.pictureUrl ? <img src={profile.pictureUrl} alt="" className="w-full h-full object-cover" /> : <User className="w-6 h-6" />}
              </div>
              <div>
                <p className="font-bold">{profile?.displayName || 'ゲスト'} 様</p>
                <p className="text-xs text-green-100">必要書類チェックリスト</p>
              </div>
            </div>
            {isSaving && <div className="flex items-center text-sm bg-white/20 px-3 py-1 rounded-full"><Loader2 className="w-4 h-4 animate-spin mr-1" />保存中</div>}
          </div>
          <div className="bg-white rounded-xl p-4 text-gray-800">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">書類準備の進捗</span>
              <span className="text-2xl font-bold text-green-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-sm text-gray-500 mt-2 text-center">{checkedCount} / {totalItems} 項目完了</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {categories.map((category) => {
          const { checked, total } = getCategoryProgress(category)
          const isComplete = checked === total
          const Icon = iconMap[category.icon]
          return (
            <div key={category.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button onClick={() => setExpandedCategory(expandedCategory === category.id ? -1 : category.id)} className="w-full p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`${category.color} p-2.5 rounded-xl mr-3`}><Icon className="w-5 h-5 text-white" /></div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">{category.title}</p>
                    <div className="flex items-center mt-1">
                      <div className="w-20 bg-gray-200 rounded-full h-1.5 mr-2">
                        <div className={`h-1.5 rounded-full ${isComplete ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${(checked/total)*100}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{checked}/{total}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  {isComplete && <span className="text-green-500 text-sm mr-2">✓完了</span>}
                  {expandedCategory === category.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>
              </button>
              {expandedCategory === category.id && (
                <div className="border-t border-gray-100">
                  {category.items.map((item) => (
                    <div key={item.id} onClick={() => toggleItem(item.id)} className={`p-4 border-b border-gray-50 flex items-start cursor-pointer active:bg-gray-100 ${checkedItems[item.id] ? 'bg-green-50' : ''}`}>
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center mr-3 mt-0.5 ${checkedItems[item.id] ? 'bg-green-500 border-green-500 scale-110' : 'border-gray-300'}`}>
                        {checkedItems[item.id] && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${checkedItems[item.id] ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{item.name}</p>
                        <p className="text-sm text-gray-500 mt-1">📍 {item.where}</p>
                        {item.hint && <p className="text-xs text-blue-600 mt-1">💡 {item.hint}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="px-4 py-2">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800">💡 <strong>ポイント</strong><br/>・わからない書類は空欄でOK<br/>・該当しないものはスキップ<br/>・ご不明点はお気軽にご質問を</p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <button onClick={sendMessage} className="w-full bg-green-500 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center active:bg-green-600">
          <MessageCircle className="w-5 h-5 mr-2" />税理士に質問する
        </button>
      </div>
    </div>
  )
}

// メインApp - URLパスでルーティング
export default function App() {
  const isAdmin = window.location.pathname.includes('/admin')
  return isAdmin ? <AdminPage /> : <ChecklistPage />
}
