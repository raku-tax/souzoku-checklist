import { useState, useEffect } from 'react'
import liff from '@line/liff'
import { Check, ChevronDown, ChevronUp, FileText, User, Building, CreditCard, Shield, Receipt, MessageCircle, Loader2 } from 'lucide-react'

// ★★★ 後でLIFF IDに置き換えます ★★★
const LIFF_ID = "YOUR_LIFF_ID"

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

const iconMap = { FileText, User, Building, CreditCard, Shield, Receipt }

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [profile, setProfile] = useState(null)
  const [expandedCategory, setExpandedCategory] = useState(0)
  const [checkedItems, setCheckedItems] = useState({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    initializeLiff()
  }, [])

  const initializeLiff = async () => {
    try {
      await liff.init({ liffId: LIFF_ID })
      if (liff.isLoggedIn()) {
        const userProfile = await liff.getProfile()
        setProfile(userProfile)
        loadCheckedItems(userProfile.userId)
      } else {
        liff.login()
      }
    } catch (e) {
      setError('アプリの初期化に失敗しました')
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCheckedItems = (userId) => {
    const saved = localStorage.getItem(`checklist_${userId}`)
    if (saved) setCheckedItems(JSON.parse(saved))
  }

  const saveCheckedItems = (userId, items) => {
    localStorage.setItem(`checklist_${userId}`, JSON.stringify(items))
  }

  const toggleItem = async (itemId) => {
    if (!profile) return
    setIsSaving(true)
    const newItems = { ...checkedItems, [itemId]: !checkedItems[itemId] }
    setCheckedItems(newItems)
    saveCheckedItems(profile.userId, newItems)
    await new Promise(r => setTimeout(r, 300))
    setIsSaving(false)
  }

  const sendMessage = () => {
    if (liff.isInClient()) {
      liff.closeWindow()
    } else {
      alert('LINEアプリからアクセスしてください')
    }
  }

  const totalItems = categories.reduce((s, c) => s + c.items.length, 0)
  const checkedCount = Object.values(checkedItems).filter(Boolean).length
  const progress = Math.round((checkedCount / totalItems) * 100)

  const getCategoryProgress = (cat) => {
    const checked = cat.items.filter(i => checkedItems[i.id]).length
    return { checked, total: cat.items.length }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-500 to-green-600 flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-green-500" />
        </div>
        <h1 className="text-xl font-bold mb-2">相続税チェックリスト</h1>
        <Loader2 className="w-8 h-8 animate-spin mt-4" />
        <p className="mt-4 text-sm text-green-100">読み込み中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 text-center shadow">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-green-500 text-white px-6 py-2 rounded-lg">
            再読み込み
          </button>
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
                {profile?.pictureUrl ? (
                  <img src={profile.pictureUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6" />
                )}
              </div>
              <div>
                <p className="font-bold">{profile?.displayName || 'ゲスト'} 様</p>
                <p className="text-xs text-green-100">必要書類チェックリスト</p>
              </div>
            </div>
            {isSaving && (
              <div className="flex items-center text-sm bg-white/20 px-3 py-1 rounded-full">
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
                保存中
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-4 text-gray-800">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">書類準備の進捗</span>
              <span className="text-2xl font-bold text-green-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2 text-center">
              {checkedCount} / {totalItems} 項目完了
            </p>
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
              <button
                onClick={() => setExpandedCategory(expandedCategory === category.id ? -1 : category.id)}
                className="w-full p-4 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div className={`${category.color} p-2.5 rounded-xl mr-3`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">{category.title}</p>
                    <div className="flex items-center mt-1">
                      <div className="w-20 bg-gray-200 rounded-full h-1.5 mr-2">
                        <div 
                          className={`h-1.5 rounded-full ${isComplete ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: `${(checked/total)*100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{checked}/{total}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  {isComplete && <span className="text-green-500 text-sm mr-2">✓完了</span>}
                  {expandedCategory === category.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {expandedCategory === category.id && (
                <div className="border-t border-gray-100">
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`p-4 border-b border-gray-50 flex items-start cursor-pointer active:bg-gray-100 transition-colors ${
                        checkedItems[item.id] ? 'bg-green-50' : ''
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center mr-3 mt-0.5 transition-all ${
                        checkedItems[item.id] 
                          ? 'bg-green-500 border-green-500 scale-110' 
                          : 'border-gray-300'
                      }`}>
                        {checkedItems[item.id] && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${checkedItems[item.id] ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                          {item.name}
                        </p>
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
          <p className="text-sm text-yellow-800">
            💡 <strong>ポイント</strong><br/>
            ・わからない書類は空欄でOK<br/>
            ・該当しないものはスキップ<br/>
            ・ご不明点はお気軽にご質問を
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <button 
          onClick={sendMessage}
          className="w-full bg-green-500 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center active:bg-green-600"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          税理士に質問する
        </button>
      </div>
    </div>
  )
}
