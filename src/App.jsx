import { useState, useEffect } from 'react'
import liff from '@line/liff'
import { 
  Check, ChevronDown, ChevronUp, Loader2, MessageCircle,
  User, FileText, MapPin, Building, TrendingUp, Factory,
  Wallet, Shield, Briefcase, Car, Gift, RefreshCw, Heart,
  Receipt, FolderOpen
} from 'lucide-react'

const LIFF_ID = "2008786355-AntIpNJL"
const API_URL = "https://script.google.com/macros/s/AKfycbyqPL0rAgeCp9Uuj2STuP55jmb-XBn5U19Hr3oy-jOEz-hzM7hwv0b_uP1toYUN5ULD/exec"

const categories = [
  {
    id: 0, title: '【1】本人確認書類', icon: 'User', color: 'bg-blue-500',
    items: [
      { id: '1-1', name: 'マイナンバーカード または 通知カードのコピー', where: 'お手元', hint: '相続人全員の表裏両面コピー。ない場合はマイナンバー記載の住民票でも可' },
      { id: '1-2', name: '本人確認書類のコピー', where: 'お手元', hint: '相続人全員の運転免許証・パスポート・健康保険証などいずれか1つ' },
    ]
  },
  {
    id: 1, title: '【2】戸籍関係書類', icon: 'FileText', color: 'bg-green-500',
    items: [
      { id: '2-1', name: '被相続人の戸籍謄本（出生〜死亡）', where: '本籍地の役場', hint: '転籍がある場合は複数の役場から取得。死亡日から10日経過後に発行のもの' },
      { id: '2-2', name: '被相続人の住民票の除票', where: '最後の住所地の役場', hint: '「本籍地記載あり」で取得' },
      { id: '2-3', name: '被相続人の戸籍の附票', where: '本籍地の役場', hint: '老人ホーム入居や相続時精算課税利用の場合に必要' },
      { id: '2-4', name: '死亡届・死亡診断書のコピー', where: 'お手元', hint: 'お手元にあるコピーで大丈夫です' },
      { id: '2-5', name: '相続人全員の戸籍謄本', where: '各相続人の本籍地の役場', hint: 'コンビニでマイナンバーカードを使って取得も可能' },
      { id: '2-6', name: '相続人全員の住民票', where: '各相続人の住所地の役場', hint: '家族全員の記載があるもの' },
      { id: '2-7', name: '相続人全員の戸籍の附票', where: '各相続人の本籍地の役場', hint: '「家なき子特例」を受ける場合に必要' },
      { id: '2-8', name: '相続人全員の印鑑証明書', where: '各相続人の住所地の役場', hint: '公正証書遺言がある場合は不要' },
      { id: '2-9', name: '法定相続情報一覧図の写し（任意）', where: '法務局', hint: '銀行手続きが多い場合は便利。必須ではありません' },
    ]
  },
  {
    id: 2, title: '【3】土地', icon: 'MapPin', color: 'bg-orange-500',
    items: [
      { id: '3-1', name: '固定資産税の納税通知書・課税明細書', where: 'お手元', hint: '毎年4〜5月頃届くもの' },
      { id: '3-2', name: '登記簿謄本（全部事項証明書）', where: '法務局', hint: 'オンラインの「登記情報提供サービス」でも取得可能' },
      { id: '3-3', name: '地積測量図・公図', where: '法務局', hint: 'ない土地もあります。その場合は不要' },
      { id: '3-4', name: '固定資産評価証明書', where: '不動産所在地の役場', hint: '相続登記にも必要な書類です' },
      { id: '3-5', name: '名寄帳（なよせちょう）', where: '不動産所在地の役場', hint: '非課税の道路や共有名義も含めて発行依頼。漏れ防止に役立ちます' },
      { id: '3-6', name: '賃貸借契約書（貸している土地がある場合）', where: 'お手元', hint: '駐車場として貸している場合も含みます' },
      { id: '3-7', name: '土地無償返還に関する届出書（該当する場合）', where: 'お手元', hint: '同族会社に土地を貸している場合。不明なら「不明」でOK' },
    ]
  },
  {
    id: 3, title: '【4】建物', icon: 'Building', color: 'bg-amber-600',
    items: [
      { id: '4-1', name: '登記簿謄本（全部事項証明書）', where: '法務局', hint: '土地と一緒に取得すると効率的' },
      { id: '4-2', name: '固定資産評価証明書', where: '不動産所在地の役場', hint: '土地の評価証明書と一緒に取得可能' },
      { id: '4-3', name: '名寄帳（なよせちょう）', where: '不動産所在地の役場', hint: '土地の名寄帳と一緒に取得可能' },
      { id: '4-4', name: '建築図面・間取図（貸家・アパートの場合）', where: 'お手元', hint: '賃貸割合を計算するために必要' },
      { id: '4-5', name: '賃貸借契約書（貸家・アパートの場合）', where: 'お手元', hint: '入居者全員分の最新の契約書' },
    ]
  },
  {
    id: 4, title: '【5】上場株式等', icon: 'TrendingUp', color: 'bg-purple-500',
    items: [
      { id: '5-1', name: '証券会社の残高証明書', where: '取引のある証券会社', hint: '「死亡日時点」の残高で発行依頼。複数の証券会社がある場合はすべて' },
      { id: '5-2', name: '株主名簿上の残高証明書', where: '信託銀行の証券代行部', hint: '単元未満株（端株）確認のため。配当金通知書に記載の信託銀行へ' },
      { id: '5-3', name: '配当金支払通知書', where: 'お手元', hint: '届いた配当金のお知らせハガキ' },
      { id: '5-4', name: '過去5年分の取引残高報告書', where: '取引のある証券会社', hint: '過去の贈与や保険契約の確認のため' },
      { id: '5-5', name: 'ファンドラップ関連書類（該当する場合）', where: '取引のある証券会社', hint: '売却額・取得価額・手数料がわかる書類' },
    ]
  },
  {
    id: 5, title: '【6】非上場株式', icon: 'Factory', color: 'bg-indigo-500',
    items: [
      { id: '6-1', name: '非上場会社の法人税申告書（過去3期分）', where: '該当する会社', hint: '同族会社の株式をお持ちの場合。会社の顧問税理士にご相談ください' },
    ]
  },
  {
    id: 6, title: '【7】現金預金', icon: 'Wallet', color: 'bg-emerald-500',
    items: [
      { id: '7-1', name: '預金残高証明書', where: '取引のある金融機関', hint: '「死亡日時点」の残高で発行依頼。定期預金は「既経過利息」の記載も' },
      { id: '7-2', name: 'ゆうちょ銀行の現存調査', where: 'ゆうちょ銀行窓口', hint: '「貯金等照会書（相続用）」を提出。国債・投資信託・かんぽ生命も確認' },
      { id: '7-3', name: '既経過利息計算書（定期預金がある場合）', where: '取引のある金融機関', hint: '残高証明書と一緒に発行されます' },
      { id: '7-4', name: '過去5年分の通帳・定期預金証書', where: 'お手元', hint: '口座凍結前にATMで記帳を。紛失時は金融機関で「取引明細書」を発行' },
      { id: '7-5', name: '名義預金に関する資料（該当する場合）', where: 'お手元', hint: '亡くなった方が出資して他の名義で作った預金。税務調査で指摘されやすい項目' },
      { id: '7-6', name: '手元現金の金額', where: 'メモでOK', hint: '自宅にあった現金（財布・タンス）。概算金額で構いません' },
    ]
  },
  {
    id: 7, title: '【8】生命保険金等', icon: 'Shield', color: 'bg-pink-500',
    items: [
      { id: '8-1', name: '死亡保険金支払明細書', where: '保険会社から届いたもの', hint: '複数の保険に加入していた場合はすべて' },
      { id: '8-2', name: '保険証券のコピー', where: 'お手元', hint: '契約者・被保険者・受取人の確認のため' },
      { id: '8-3', name: '火災保険の書類', where: 'お手元／保険会社', hint: '満期返戻金があるタイプ（JA建物更生共済など）は「解約返戻金証明書」を依頼' },
      { id: '8-4', name: '解約返戻金証明書（保険金未受取の契約）', where: '保険会社・共済組合', hint: '亡くなった日時点で解約した場合の金額' },
      { id: '8-5', name: '個人年金の継続受給権の評価額（該当する場合）', where: '保険会社', hint: '個人年金を受給中または受給前だった場合に必要' },
    ]
  },
  {
    id: 8, title: '【9】退職手当金等', icon: 'Briefcase', color: 'bg-cyan-600',
    items: [
      { id: '9-1', name: '死亡退職金の支払明細', where: '亡くなった方の勤務先', hint: '会社員や役員だった場合に該当' },
      { id: '9-2', name: '弔慰金の支払明細', where: '亡くなった方の勤務先', hint: '一定額まで非課税ですが金額確認が必要' },
    ]
  },
  {
    id: 9, title: '【10】その他財産', icon: 'Car', color: 'bg-teal-500',
    items: [
      { id: '10-1', name: '貸付金の資料（該当する場合）', where: 'お手元', hint: '誰かにお金を貸していた場合の契約書・借用書' },
      { id: '10-2', name: '未収入金・還付金の資料', where: 'お手元', hint: '所得税還付金、老人ホーム返還金、高額療養費還付金など' },
      { id: '10-3', name: '自動車の車検証', where: 'お手元（車内）', hint: '査定書も取得。売却済みなら売却金額の書類' },
      { id: '10-4', name: 'ゴルフ会員権・リゾート会員権（該当する場合）', where: 'お手元', hint: '証書・預託金証書・契約書など' },
      { id: '10-5', name: '美術品・貴金属・骨董品等（該当する場合）', where: 'お手元', hint: '鑑定書、作品の写真。著名作家の作品は評価査定を' },
      { id: '10-6', name: '家庭用財産一式', where: 'メモでOK', hint: '家具・家電など。概算金額で構いません' },
      { id: '10-7', name: '国外財産（該当する場合）', where: 'お手元', hint: '海外の不動産、外国の銀行口座など' },
      { id: '10-8', name: 'その他の財産', where: 'お手元', hint: '生協出資金、ワリコーなど財産価値があるもの' },
    ]
  },
  {
    id: 10, title: '【11】暦年贈与', icon: 'Gift', color: 'bg-rose-500',
    items: [
      { id: '11-1', name: '過去の贈与税申告書', where: 'お手元', hint: '亡くなる前3年以内の贈与は相続財産に加算。110万円以下も該当すればお知らせを' },
      { id: '11-2', name: '贈与契約書', where: 'お手元', hint: '現金や不動産の贈与を受けた際の契約書' },
      { id: '11-3', name: '贈与による移管証券のお知らせ', where: '証券会社から届いたもの', hint: '株式・投資信託の贈与を受けた場合に届く書類' },
    ]
  },
  {
    id: 11, title: '【12】相続時精算課税制度', icon: 'RefreshCw', color: 'bg-violet-500',
    items: [
      { id: '12-1', name: '相続時精算課税選択届出書', where: 'お手元', hint: '2,500万円までの非課税贈与。不明な場合は税務署で開示請求が可能' },
      { id: '12-2', name: '相続時精算課税に関する贈与契約書等', where: 'お手元', hint: '贈与を受けた財産の内容と金額がわかる書類' },
    ]
  },
  {
    id: 12, title: '【13】その他贈与', icon: 'Heart', color: 'bg-fuchsia-500',
    items: [
      { id: '13-1', name: '教育資金の一括贈与に関する書類（該当する場合）', where: 'お手元／金融機関', hint: '祖父母から孫への教育資金贈与（1,500万円まで非課税）' },
      { id: '13-2', name: '結婚・子育て資金の一括贈与に関する書類（該当する場合）', where: 'お手元／金融機関', hint: '結婚・子育て資金の贈与（1,000万円まで非課税）' },
      { id: '13-3', name: '住宅取得等資金の贈与に関する書類（該当する場合）', where: 'お手元', hint: '住宅購入のための資金贈与を受けた場合' },
      { id: '13-4', name: 'おしどり贈与（配偶者控除）に関する書類（該当する場合）', where: 'お手元', hint: '婚姻20年以上の夫婦間で居住用不動産の贈与（最大2,000万円非課税）' },
    ]
  },
  {
    id: 13, title: '【14】債務・葬式費用', icon: 'Receipt', color: 'bg-red-500',
    items: [
      { id: '14-1', name: 'ローン残高証明書', where: '銀行・リース会社など', hint: '住宅・自動車・カードローンすべて「死亡日時点」の残高で' },
      { id: '14-2', name: 'ローン契約書・返済予定表', where: 'お手元', hint: '残高証明書と合わせてご用意ください' },
      { id: '14-3', name: '未払いの税金の通知書', where: 'お手元', hint: '住民税、固定資産税、事業税、国民健康保険料など' },
      { id: '14-4', name: '未払いの医療費・介護費用の領収書', where: '病院・介護施設', hint: '入院中に亡くなった場合など' },
      { id: '14-5', name: '未払いの公共料金・クレジットカード明細', where: 'お手元', hint: '電気・ガス・水道料金、クレジットカード利用明細' },
      { id: '14-6', name: '葬儀費用の領収書', where: 'お手元', hint: '領収書と明細書の両方。葬式代・飲食代・お布施・心づけ・埋葬代など' },
      { id: '14-7', name: 'お布施・心づけ等のメモ', where: 'ご自身で作成', hint: '領収書がないものはメモでOK。金額・支払日・支払先を記入' },
    ]
  },
  {
    id: 14, title: '【15】その他', icon: 'FolderOpen', color: 'bg-slate-600',
    items: [
      { id: '15-1', name: '亡くなった方の過去4年分の確定申告書', where: 'お手元', hint: '不動産収入や事業収入があった方は必要' },
      { id: '15-2', name: '準確定申告の必要書類', where: '別途ご案内', hint: '弊社にご依頼いただく場合は別途ご案内します' },
      { id: '15-3', name: '過去の相続税申告書（該当する場合）', where: 'お手元', hint: '過去10年以内に相続税を払っている場合、控除の可能性あり' },
      { id: '15-4', name: '遺言書', where: 'お手元／公証役場', hint: '自筆証書遺言の場合は検認証明書もご用意ください' },
      { id: '15-5', name: '障害者手帳のコピー（該当する場合）', where: 'お手元', hint: '相続人に障害をお持ちの方がいる場合。障害者控除の対象になります' },
      { id: '15-6', name: '老人ホームの入居契約書・退去時精算書', where: 'お手元', hint: '小規模宅地等の特例を受ける場合に必要' },
      { id: '15-7', name: '介護保険の被保険者証のコピー', where: 'お手元', hint: '老人ホーム入居で小規模宅地等の特例を受ける場合' },
      { id: '15-8', name: '家なき子特例の資料（該当する場合）', where: 'お手元', hint: '過去3年分の賃貸借契約書、住んでいる建物の登記簿謄本' },
      { id: '15-9', name: '特別代理人選任の審判書（未成年の相続人がいる場合）', where: '家庭裁判所', hint: '相続人に未成年者がいる場合に必要' },
    ]
  },
]

const iconMap = { 
  User, FileText, MapPin, Building, TrendingUp, Factory,
  Wallet, Shield, Briefcase, Car, Gift, RefreshCw, Heart,
  Receipt, FolderOpen
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [profile, setProfile] = useState(null)
  const [expandedCategory, setExpandedCategory] = useState(null)
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

  const loadCheckedItems = async (userId) => {
    try {
      const response = await fetch(`${API_URL}?userId=${userId}`)
      const data = await response.json()
      if (data.checkedItems) {
        setCheckedItems(data.checkedItems)
      }
    } catch (e) {
      const saved = localStorage.getItem(`checklist_${userId}`)
      if (saved) setCheckedItems(JSON.parse(saved))
    }
  }

  const saveCheckedItems = async (userId, items) => {
    localStorage.setItem(`checklist_${userId}`, JSON.stringify(items))
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, checkedItems: items })
      })
    } catch (e) {
      console.error('保存エラー:', e)
    }
  }

  const toggleItem = async (itemId) => {
    if (!profile) return
    setIsSaving(true)
    const newItems = { ...checkedItems, [itemId]: !checkedItems[itemId] }
    setCheckedItems(newItems)
    await saveCheckedItems(profile.userId, newItems)
    setIsSaving(false)
  }

  const totalItems = categories.reduce((s, c) => s + c.items.length, 0)
  const checkedCount = Object.values(checkedItems).filter(Boolean).length
  const progress = Math.round((checkedCount / totalItems) * 100)

  const getCategoryProgress = (cat) => {
    const checked = cat.items.filter(i => checkedItems[i.id]).length
    return { checked, total: cat.items.length }
  }

  const openLineChat = () => {
    if (liff.isInClient()) {
      liff.closeWindow()
    } else {
      window.open('https://line.me/R/oaMessage/@YOUR_LINE_ID', '_blank')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-600 to-emerald-700 flex flex-col items-center justify-center text-white">
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg">
          <FileText className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-xl font-bold mb-2">相続税チェックリスト</h1>
        <Loader2 className="w-8 h-8 animate-spin mt-4" />
        <p className="mt-4 text-sm text-emerald-100">読み込み中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 text-center shadow-lg">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition"
          >
            再読み込み
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white sticky top-0 z-10 shadow-lg">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                {profile?.pictureUrl ? (
                  <img src={profile.pictureUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className="text-sm text-emerald-100">こんにちは</p>
                <p className="font-bold">{profile?.displayName || 'ゲスト'}様</p>
              </div>
            </div>
            {isSaving && (
              <div className="flex items-center text-emerald-100 text-sm">
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
                保存中
              </div>
            )}
          </div>
          
          {/* プログレスバー */}
          <div className="bg-white/20 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-emerald-100">進捗状況</span>
            <span className="font-bold">{checkedCount} / {totalItems} 完了 ({progress}%)</span>
          </div>
        </div>
      </div>

      {/* カテゴリ一覧 */}
      <div className="p-4 space-y-3">
        {categories.map((category) => {
          const Icon = iconMap[category.icon]
          const { checked, total } = getCategoryProgress(category)
          const isExpanded = expandedCategory === category.id
          const isComplete = checked === total

          return (
            <div key={category.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div className="flex items-center">
                  <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center mr-3 ${isComplete ? 'ring-2 ring-emerald-400 ring-offset-2' : ''}`}>
                    {isComplete ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <Icon className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className={`font-medium ${isComplete ? 'text-emerald-600' : 'text-gray-800'}`}>
                      {category.title}
                    </p>
                    <p className="text-sm text-gray-500">{checked} / {total} 完了</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-2 bg-gray-200 rounded-full mr-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${isComplete ? 'bg-emerald-500' : 'bg-emerald-400'}`}
                      style={{ width: `${(checked / total) * 100}%` }}
                    />
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100">
                  {category.items.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`p-4 flex items-start ${idx !== category.items.length - 1 ? 'border-b border-gray-50' : ''} ${checkedItems[item.id] ? 'bg-emerald-50/50' : ''}`}
                    >
                      <button
                        onClick={() => toggleItem(item.id)}
                        className={`w-6 h-6 rounded-md border-2 flex-shrink-0 mr-3 mt-0.5 flex items-center justify-center transition-all ${
                          checkedItems[item.id]
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-gray-300 hover:border-emerald-400'
                        }`}
                      >
                        {checkedItems[item.id] && <Check className="w-4 h-4 text-white" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${checkedItems[item.id] ? 'text-emerald-700 line-through opacity-70' : 'text-gray-800'}`}>
                          {item.name}
                        </p>
                        <p className="text-sm text-emerald-600 mt-1">📍 {item.where}</p>
                        {item.hint && (
                          <p className="text-sm text-gray-500 mt-1">💡 {item.hint}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* フッター */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <button
          onClick={openLineChat}
          className="w-full bg-emerald-500 text-white py-4 rounded-xl font-bold flex items-center justify-center hover:bg-emerald-600 transition shadow-md"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          税理士に質問する
        </button>
      </div>
    </div>
  )
}
