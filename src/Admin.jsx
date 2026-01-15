import { useState, useEffect } from 'react'
import { Lock, RefreshCw, Users, CheckCircle, AlertCircle, ChevronDown, ChevronUp, FileText, MapPin, Building, TrendingUp, Factory, Wallet, Shield, Briefcase, Car, Gift, RefreshCw as RefreshIcon, Heart, Receipt, FolderOpen, User } from 'lucide-react'

const API_URL = "https://script.google.com/macros/s/AKfycbyqPL0rAgeCp9Uuj2STuP55jmb-XBn5U19Hr3oy-jOEz-hzM7hwv0b_uP1toYUN5ULD/exec"
const ADMIN_PASSWORD = "raku2024"

// 新しい15カテゴリ・75項目の定義
const categories = [
  {
    id: 0, title: '【1】本人確認書類', icon: 'User', color: 'bg-blue-500',
    items: [
      { id: '1-1', name: 'マイナンバーカード または 通知カードのコピー' },
      { id: '1-2', name: '本人確認書類のコピー' },
    ]
  },
  {
    id: 1, title: '【2】戸籍関係書類', icon: 'FileText', color: 'bg-green-500',
    items: [
      { id: '2-1', name: '被相続人（亡くなった方）の戸籍謄本' },
      { id: '2-2', name: '被相続人（亡くなった方）の住民票の除票' },
      { id: '2-3', name: '被相続人（亡くなった方）の戸籍の附票' },
      { id: '2-4', name: '死亡届・死亡診断書のコピー' },
      { id: '2-5', name: '相続人全員の戸籍謄本' },
      { id: '2-6', name: '相続人全員の住民票' },
      { id: '2-7', name: '相続人全員の戸籍の附票' },
      { id: '2-8', name: '相続人全員の印鑑証明書' },
      { id: '2-9', name: '法定相続情報一覧図の写し（任意）' },
    ]
  },
  {
    id: 2, title: '【3】土地', icon: 'MapPin', color: 'bg-orange-500',
    items: [
      { id: '3-1', name: '固定資産税の納税通知書・課税明細書' },
      { id: '3-2', name: '登記簿謄本（全部事項証明書）' },
      { id: '3-3', name: '地積測量図・公図' },
      { id: '3-4', name: '固定資産評価証明書' },
      { id: '3-5', name: '名寄帳（なよせちょう）' },
      { id: '3-6', name: '賃貸借契約書（貸している土地がある場合）' },
      { id: '3-7', name: '土地無償返還に関する届出書（該当する場合）' },
    ]
  },
  {
    id: 3, title: '【4】建物', icon: 'Building', color: 'bg-amber-600',
    items: [
      { id: '4-1', name: '登記簿謄本（全部事項証明書）' },
      { id: '4-2', name: '固定資産評価証明書' },
      { id: '4-3', name: '名寄帳（なよせちょう）' },
      { id: '4-4', name: '建築図面・間取図（貸家・アパートの場合）' },
      { id: '4-5', name: '賃貸借契約書（貸家・アパートの場合）' },
    ]
  },
  {
    id: 4, title: '【5】上場株式等', icon: 'TrendingUp', color: 'bg-purple-500',
    items: [
      { id: '5-1', name: '証券会社の残高証明書' },
      { id: '5-2', name: '株主名簿上の残高証明書' },
      { id: '5-3', name: '配当金支払通知書' },
      { id: '5-4', name: '過去5年分の取引残高報告書または顧客勘定元帳' },
      { id: '5-5', name: 'ファンドラップ関連書類（該当する場合）' },
    ]
  },
  {
    id: 5, title: '【6】非上場株式', icon: 'Factory', color: 'bg-indigo-500',
    items: [
      { id: '6-1', name: '非上場会社の法人税申告書（過去3期分）' },
    ]
  },
  {
    id: 6, title: '【7】現金預金', icon: 'Wallet', color: 'bg-emerald-500',
    items: [
      { id: '7-1', name: '預金残高証明書' },
      { id: '7-2', name: 'ゆうちょ銀行の現存調査' },
      { id: '7-3', name: '既経過利息計算書（定期預金がある場合）' },
      { id: '7-4', name: '過去5年分の通帳・定期預金証書' },
      { id: '7-5', name: '名義預金に関する資料（該当する場合）' },
      { id: '7-6', name: '手元現金の金額' },
    ]
  },
  {
    id: 7, title: '【8】生命保険金等', icon: 'Shield', color: 'bg-pink-500',
    items: [
      { id: '8-1', name: '死亡保険金支払明細書' },
      { id: '8-2', name: '保険証券のコピー' },
      { id: '8-3', name: '火災保険の書類' },
      { id: '8-4', name: '解約返戻金証明書（まだ保険金を受け取っていない契約）' },
      { id: '8-5', name: '個人年金の継続受給権の評価額（該当する場合）' },
    ]
  },
  {
    id: 8, title: '【9】退職手当金等', icon: 'Briefcase', color: 'bg-cyan-600',
    items: [
      { id: '9-1', name: '死亡退職金の支払明細' },
      { id: '9-2', name: '弔慰金の支払明細' },
    ]
  },
  {
    id: 9, title: '【10】その他財産', icon: 'Car', color: 'bg-teal-500',
    items: [
      { id: '10-1', name: '貸付金の資料（該当する場合）' },
      { id: '10-2', name: '未収入金・還付金の資料' },
      { id: '10-3', name: '自動車の車検証' },
      { id: '10-4', name: 'ゴルフ会員権・リゾート会員権（該当する場合）' },
      { id: '10-5', name: '美術品・貴金属・骨董品等（該当する場合）' },
      { id: '10-6', name: '家庭用財産一式' },
      { id: '10-7', name: '国外財産（該当する場合）' },
      { id: '10-8', name: 'その他の財産' },
    ]
  },
  {
    id: 10, title: '【11】暦年贈与', icon: 'Gift', color: 'bg-rose-500',
    items: [
      { id: '11-1', name: '過去の贈与税申告書' },
      { id: '11-2', name: '贈与契約書' },
      { id: '11-3', name: '贈与による移管証券のお知らせ' },
    ]
  },
  {
    id: 11, title: '【12】相続時精算課税制度', icon: 'RefreshCw', color: 'bg-violet-500',
    items: [
      { id: '12-1', name: '相続時精算課税選択届出書' },
      { id: '12-2', name: '相続時精算課税に関する贈与契約書等' },
    ]
  },
  {
    id: 12, title: '【13】その他贈与', icon: 'Heart', color: 'bg-fuchsia-500',
    items: [
      { id: '13-1', name: '教育資金の一括贈与に関する書類（該当する場合）' },
      { id: '13-2', name: '結婚・子育て資金の一括贈与に関する書類（該当する場合）' },
      { id: '13-3', name: '住宅取得等資金の贈与に関する書類（該当する場合）' },
      { id: '13-4', name: 'おしどり贈与（配偶者控除）に関する書類（該当する場合）' },
    ]
  },
  {
    id: 13, title: '【14】債務・葬式費用', icon: 'Receipt', color: 'bg-red-500',
    items: [
      { id: '14-1', name: 'ローン残高証明書' },
      { id: '14-2', name: 'ローン契約書・返済予定表' },
      { id: '14-3', name: '未払いの税金の通知書' },
      { id: '14-4', name: '未払いの医療費・介護費用の領収書' },
      { id: '14-5', name: '未払いの公共料金・クレジットカード明細' },
      { id: '14-6', name: '葬儀費用の領収書' },
      { id: '14-7', name: 'お布施・心づけ等のメモ' },
    ]
  },
  {
    id: 14, title: '【15】その他', icon: 'FolderOpen', color: 'bg-slate-600',
    items: [
      { id: '15-1', name: '亡くなった方の過去4年分の所得税・消費税申告書' },
      { id: '15-2', name: '準確定申告の必要書類' },
      { id: '15-3', name: '過去の相続税申告書（該当する場合）' },
      { id: '15-4', name: '遺言書' },
      { id: '15-5', name: '障害者手帳のコピー（該当する場合）' },
      { id: '15-6', name: '老人ホームの入居契約書・退去時精算書' },
      { id: '15-7', name: '介護保険の被保険者証のコピー' },
      { id: '15-8', name: '家なき子特例の資料（該当する場合）' },
      { id: '15-9', name: '特別代理人選任の審判書（未成年の相続人がいる場合）' },
    ]
  },
]

// 全項目のフラットリスト
const allItems = categories.flatMap(cat => cat.items)
const totalItemCount = allItems.length // 75項目

// 項目IDから項目名を取得
const getItemNameById = (itemId) => {
  const item = allItems.find(i => i.id === itemId)
  return item ? item.name : itemId
}

// 項目IDからカテゴリを取得
const getCategoryByItemId = (itemId) => {
  const catId = itemId.split('-')[0]
  return categories.find(c => c.id === parseInt(catId) - 1)
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [clients, setClients] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [expandedClient, setExpandedClient] = useState(null)
  const [clientCheckedItems, setClientCheckedItems] = useState({})

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

  const loadClientCheckedItems = async (lineId) => {
    try {
      const response = await fetch(`${API_URL}?userId=${lineId}`)
      const data = await response.json()
      if (data.checkedItems) {
        setClientCheckedItems(prev => ({ ...prev, [lineId]: data.checkedItems }))
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
      if (!clientCheckedItems[lineId]) {
        loadClientCheckedItems(lineId)
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

  // チェック済み項目数を計算
  const getCheckedCount = (checkedItems) => {
    if (!checkedItems) return 0
    return Object.values(checkedItems).filter(Boolean).length
  }

  // カテゴリごとの進捗を計算
  const getCategoryProgress = (category, checkedItems) => {
    if (!checkedItems) return { checked: 0, total: category.items.length }
    const checked = category.items.filter(item => checkedItems[item.id]).length
    return { checked, total: category.items.length }
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              className="w-full bg-emerald-500 text-white py-3 rounded-xl font-medium hover:bg-emerald-600 transition-colors"
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
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white sticky top-0 z-10 shadow-lg">
        <div className="px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold">📊 進捗管理</h1>
            <p className="text-xs text-emerald-100">相続チェックリスト（{totalItemCount}項目）</p>
          </div>
          <button
            onClick={loadClients}
            disabled={isLoading}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
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
          clients.map((client) => {
            const checkedItems = clientCheckedItems[client.lineId]
            const checkedCount = getCheckedCount(checkedItems)
            const progress = Math.round((checkedCount / totalItemCount) * 100)

            return (
              <div key={client.lineId} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div
                  onClick={() => toggleClient(client.lineId)}
                  className="p-4 cursor-pointer hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="mr-3">
                        <p className="font-bold text-gray-800">{client.name}</p>
                        <p className="text-xs text-gray-500">{client.lastUpdate}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {getStatusBadge(client.progress || progress)}
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
                          className={`h-2.5 rounded-full transition-all ${getProgressColor(client.progress || progress)}`}
                          style={{ width: `${client.progress || progress}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-800">{client.progress || progress}%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{client.completed || checkedCount} / {totalItemCount} 項目完了</p>
                </div>

                {/* Detail Section - カテゴリ別表示 */}
                {expandedClient === client.lineId && (
                  <div className="border-t border-gray-100 bg-gray-50">
                    {checkedItems ? (
                      <div className="divide-y divide-gray-100">
                        {categories.map((category) => {
                          const { checked, total } = getCategoryProgress(category, checkedItems)
                          const isComplete = checked === total
                          
                          return (
                            <div key={category.id} className="p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <div className={`w-6 h-6 ${category.color} rounded flex items-center justify-center mr-2`}>
                                    {isComplete ? (
                                      <CheckCircle className="w-4 h-4 text-white" />
                                    ) : (
                                      <span className="text-white text-xs font-bold">{category.id + 1}</span>
                                    )}
                                  </div>
                                  <span className={`text-sm font-medium ${isComplete ? 'text-emerald-600' : 'text-gray-700'}`}>
                                    {category.title}
                                  </span>
                                </div>
                                <span className={`text-xs ${isComplete ? 'text-emerald-600 font-bold' : 'text-gray-500'}`}>
                                  {checked}/{total}
                                </span>
                              </div>
                              
                              <div className="ml-8 space-y-1">
                                {category.items.map((item) => (
                                  <div key={item.id} className="flex items-center text-sm">
                                    {checkedItems[item.id] ? (
                                      <CheckCircle className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                                    ) : (
                                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full mr-2 flex-shrink-0" />
                                    )}
                                    <span className={checkedItems[item.id] ? 'text-gray-400 line-through' : 'text-gray-700'}>
                                      {item.name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">読み込み中...</div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
