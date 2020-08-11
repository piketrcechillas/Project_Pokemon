/*--------------------------------------------------------------------------
  
　修理屋を配置するスクリプト

■概要
【場所イベントの場合】
　場所イベントで店を選択し、詳細設定からカスタムパラメータに{Durability:0}を設定すると、
　店が修理屋になります。

【戦闘準備画面の場合】
　マップ情報のカスタムパラメータに{Durability:n}を設定すると、ショップアイテムで登録したn番目の店が修理屋になります。
　（1番上の店の場合n=0、上から2番目の店の場合n=1、と指定してください）

　また、ショップアイテムで登録した『修理屋として使う店にも、なんでもいいので一個販売品を登録』しておいてください。
　（一つも販売品が無い店は、SRPG STUDIO側で店として登録しないようになっているためです）
　※1.122以降では販売品に在庫数を設定出来ますが、修理屋に登録した販売品に在庫は設定しないでください（動作保証出来ません）

　　　======================================================================
　　　                      ＊＊＊注意事項＊＊＊
　　　----------------------------------------------------------------------
　　　データ設定→コンフィグ→ユーザ拡張内の『ショップ項目を準備画面のトップで表示する』にチェックを入れないでください。
　　　チェックを入れると修理屋は動作しません。
　　　======================================================================

【拠点の場合】
　拠点のショップへ作成・登録した店のカスタムパラメータに{Durability:0}を設定すると、店が修理屋になります。
　『ゲーム時にショップを一覧形式で表示する』にチェックが入っている場合は販売品の登録が不要です。
　チェックが入っていない場合は、なんでもいいので一個販売品を登録』しておいてください。
　（一覧形式を使用する場合は条件を満たした店が（販売品0でも）全て登録されるのですが、
　　一覧形式を使用していない場合、一つも販売品が無い店はSRPG STUDIO側で店として登録しないようになっているためです）
　※1.122以降では販売品に在庫数を設定出来ますが、修理屋に登録した販売品に在庫は設定しないでください（動作保証出来ません）

　　拠点でのカスタマイズ
　　　１．拠点でユニットの所持品も修理可能としたい
　　　　　→『var isDurabilityUnitItemInRest = false;』のfalseをtrueにしてください。
　　　　　　trueにした場合、ストック内の修理可能品の後ろに、生存して仲間になっている自軍ユニットの所持品が追加されます。
　　　　　　修理屋のリストに載るのは武器、杖（修理可能な武器タイプ）のみで、薬など修理不可能な品は載りません。

　　　　（以下はisDurabilityUnitItemInRest = trueとした場合に有効になる設定です）

　　　２．ユニットの顔グラの透明度（アルファ値）を変えたい
　　　　　→『var RestDurabilityFaceAlpha = 128;』の数値部分を0-255の範囲で変えて下さい。

　　　３．ユニットの顔グラの位置を変えたい
　　　　　→『var RestDurabilityFaceDrawXhosei = 120;』『var RestDurabilityFaceDrawYhosei = 0;』の数値部分を変えて下さい。

　　　４．ユニットの顔グラ描画サイズ（幅、高さ）を変えたい
　　　　　→『var RestDurabilityFaceDstWidth  = 96;』『var RestDurabilityFaceDstHeight = 24;』の数値部分を変えて下さい。

　　　５．顔グラ描画元のサイズ（幅、高さ）を変えたい
　　　　　→『var RestDurabilityFaceGettingWidth  = 96;』『var RestDurabilityFaceGettingHeight = 24;』の数値部分を変えて下さい。

　　　６．顔グラ描画元の取得位置を変えたい
　　　　　→『var RestDurabilityFaceSrcXHosei = 0;』『var RestDurabilityFaceSrcYHosei = 22;』の数値部分を変えて下さい。

【店のメッセージ登録について】
　メッセージは以下のように設定してください。
　　　「どれを買ってくれるんだい」　　　　　　　→どれを修理するかのメッセージを入れてください
　　　「ありがとう。他にも何か買ってくれるかい」→他にも何か修理するかのメッセージを入れてください
　　　「おっと、持ち物が一杯のようだぜ」　　　　→耐久度が一杯の時のメッセージを入れてください
　　　「う～ん、それはちょっと引き取れないな」　→修理できないアイテムを選んだ時のメッセージを入れてください

【修理屋の現在の仕様】
　現在は武器と杖を修理できます。
　（本ソース内の、ItemControl._isItemRepairable()にて判定を行っていますので、違う条件が必要な場合はここを修正してください）
　杖に破損時のアイテムを設定している場合、破損時のアイテムもカテゴリ：杖を設定しておかないと修理できなくなります。注意して下さい。

　金額は、修理金額の基準値に対象の使用耐久度の％をかけたものになります。
　修理金額の基準値は設定にある（var repairPricePercent = 50;）の数字部分を弄る事で変更できます（初期だと買値の50%が設定されています）
　［例］耐久１０、買値1000の品物の場合、耐久が１減るごとに５０ゴールドかかります。
　（本ソース内の、Calculator.calculateDurabilityPrice()にて金額を算出していますので、買値のn%以外の計算をしたい場合はここを修正してください）

　※修理屋の名前について
　　修理屋の名前については、他の店と異なる店名にしておいてください。
　　（修理屋、普通の店ともに同じ名前（どちらもショップ、など）というのは避けて下さい）
　　これはゲームレイアウト→コマンドレイアウトの戦闘準備で「ショップ」を表示させた場合、
　　修理屋かどうかのチェック処理で店の名前を比較している為です。


修正内容
15/10/02　新規作成
15/10/03　武器と杖だけ修理できるように修正
15/10/12　戦闘準備画面に修理屋を設定できるように修正
　　　　　（ただし『ショップ項目を準備画面のトップで表示する』にチェックが入っていると動作しません）
15/11/05　破損時の武器が設定されている場合、修理費用が破損時の武器の値段で算出されていたバグを修正
　　　　　壊れた武器の修理金額が本来の金額（元の値段の半額）より増加していたバグを修正
16/04/27　1.073対応
16/09/22　破損時の杖が設定されている場合、修理費用が破損時の武器の値段で算出されていたバグを修正
　　　　　修理金額の基準値を買値のn%で設定できるように修正した。
16/09/24　1.094対応
16/12/15　1.106対応
17/04/19　1.122対応
18/12/01　「00_武器タイプ：杖を増やす.js」との併用に対応
18/12/15　拠点でも修理屋が使用出来るよう対応
18/12/28　修理アニメをスキップする設定を暫定追加（var isSkipDurability = true;にすれば修理アニメをスキップします）
20/02/29　キャラ歩行操作.jsに対応
20/05/18　拠点に配置した修理屋でユニットの所持品を修理可能にする設定を追加
20/05/21　拠点の修理屋でユニット所持品を修理可能にした時、ストックに何もアイテムが無いと修理ができなくなるバグを修正
20/06/13　ゲームレイアウト→コマンドレイアウトの戦闘準備で「ショップ」を表示させた場合修理屋に入るとエラーになるバグを修正


■対応バージョン
　SRPG Studio Version:1.213


■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。どんどん改造してください。
・クレジット明記無し　OK
・再配布、転載　OK
・wiki掲載　OK
・SRPG Studio利用規約は遵守してください。
  
--------------------------------------------------------------------------*/


//--------------------------------------
// 設定（外部）
//--------------------------------------
// 修理金額の基準値（買値のn%。これに使用耐久度の％をかけた値が修理費になる）
var repairPricePercent = 100;		// nは1以上の値にしてください
var isSkipDurability   = false;		// 修理時の耐久度回復アニメをスキップするか（false:スキップしない true:スキップする）

var isDurabilityUnitItemInRest = false;	// 拠点でユニットの所持品も修理可能か（false:所持品は修理不可 true:所持品修理可）

// 拠点でユニットの所持品を修理する際の顔画像に関する設定
var RestDurabilityFaceAlpha = 128;		// 顔画像のアルファ値（0-255）

var RestDurabilityFaceDrawXhosei = 120;	// 顔画像の表示X補正
var RestDurabilityFaceDrawYhosei = 0;	// 顔画像の表示Y補正

var RestDurabilityFaceDstWidth  = 96;	// 描画先：顔画像の幅
var RestDurabilityFaceDstHeight = 24;	// 描画先：顔画像の高さ

var RestDurabilityFaceGettingWidth  = 96;	// 描画元：顔画像から描画用に取得する幅
var RestDurabilityFaceGettingHeight = 24;	// 描画元：顔画像から描画用に取得する高さ

var RestDurabilityFaceSrcXHosei = 0;	// 描画元：顔画像の取得位置X補正
var RestDurabilityFaceSrcYHosei = 22;	// 描画元：顔画像の取得位置Y補正


(function() {
//--------------------------------------
// 設定（内部）
//--------------------------------------




//-------------------------------------
// MarshalCommandWindowクラス
//-------------------------------------
// ショップの追加処理
MarshalCommandWindow._appendShop= function(groupArray) {
		var i, shopData;
		var list = root.getCurrentSession().getCurrentMapInfo().getShopDataList();
		var count = list.getCount();
		
		// 現在章のマップ情報のカスタムにDurability:nが指定されていた場合、n番目の店を修理屋にする(nは0～[店数-1]の範囲)
		var durability = -1;
		var mapinfo = root.getCurrentSession().getCurrentMapInfo();
		if( typeof mapinfo.custom.Durability === 'number' ){
			durability = mapinfo.custom.Durability;
		}

		for (i = 0; i < count; i++) {
			shopData = list.getData(i);
			if (shopData.getShopItemArray().length > 0) {
				if( i == durability ) {
					// n番目の店を修理屋にする(nは0～[店数-1]の範囲)
					groupArray.appendObject(MarshalCommand.Shop2);
				}
				else {
					groupArray.appendObject(MarshalCommand.Shop);
				}
				groupArray[groupArray.length - 1].setShopData(shopData);
			}
		}
}




//-------------------------------------
// UnitCommand.Shop2クラス(派生)
//-------------------------------------
MarshalCommand.Shop2 = defineObject(MarshalCommand.Shop,	// MarshalCommand.Shopクラスの派生
{
	checkCommand: function() {
		var screenParam = this._createScreenParam();
			
		if (screenParam.unit === null) {
			return false;
		}
		
		this._shopLayoutScreen = createObject(DurabilityShopLayoutScreen);	// 修理屋のレイアウトクラス呼び出しに差し替え
		this._shopLayoutScreen.setScreenInteropData(screenParam.shopLayout.getShopInteropData());
		SceneManager.addScreen(this._shopLayoutScreen, screenParam);
		
		return true;
	}
}
);




//-------------------------------------
// UnitCommand.Shopクラス
//-------------------------------------
UnitCommand.Shop._moveTop= function() {
		var screenParam;
		var event = this._getEvent();

		if (this._capsuleEvent.moveCapsuleEvent() !== MoveResult.CONTINUE) {
			screenParam = this._createScreenParam();

			if( typeof event.custom.Durability === 'number' ){
				this._shopLayoutScreen = createObject(DurabilityShopLayoutScreen);
			}
			else{
				this._shopLayoutScreen = createObject(ShopLayoutScreen);
			}
			this._shopLayoutScreen.setScreenInteropData(screenParam.shopLayout.getShopInteropData());
			SceneManager.addScreen(this._shopLayoutScreen, screenParam);
			
			this.changeCycleMode(ShopCommandMode.SCREEN);
		}
		
		return MoveResult.CONTINUE;
};




//-------------------------------------
// ShopScreenLauncherクラス
//-------------------------------------
var alias00 = ShopScreenLauncher.openScreenLauncher;
ShopScreenLauncher.openScreenLauncher= function() {
		var i, count, list, shopData, Durability;
		var scene = root.getBaseScene();
		
		// 拠点の店にカスタムパラメータ{Durability:0}があれば修理屋をセット
		if( scene === SceneType.REST && typeof this._shopData.custom.Durability === 'number' ) {
			var screenParam = this._createScreenParam();
			
			// isDurabilityUnitItemInRestがtrueでなければユニットの所持品修理が出来ないDurabilityShopLayoutScreenをセット
			if( isDurabilityUnitItemInRest !== true ) {
				this._screen = createObject(DurabilityShopLayoutScreen);
			}
			// isDurabilityUnitItemInRestがtrueならユニットの所持品修理が出来るShopLayoutScreenForRestをセット
			else {
				this._screen = createObject(ShopLayoutScreenForRest);
			}
			this._screen.setScreenInteropData(screenParam.shopLayout.getShopInteropData());
			SceneManager.addScreen(this._screen, screenParam);
			return;
		}
		// 出撃前画面の店の場合、MapInfoにカスタムパラメータ{Durability:XX}があれば修理屋をセット
		else if( scene === SceneType.BATTLESETUP ) {
			Durability = root.getCurrentSession().getCurrentMapInfo().custom.Durability;
			if( typeof Durability === 'number' ){
				list = root.getCurrentSession().getCurrentMapInfo().getShopDataList();
				count = list.getCount();
				for (i = 0; i < count; i++) {
					shopData = list.getData(i);
					// 店の名前がマップ情報の店名と一致し、{Durability:XX}の位置にある場合は修理屋をセット
					if( shopData.getName() === this._shopData.getName() && i === Durability ) {
						var screenParam = this._createScreenParam();
						
						// isDurabilityUnitItemInRestがtrueでなければユニットの所持品修理が出来ないDurabilityShopLayoutScreenをセット
						if( isDurabilityUnitItemInRest !== true ) {
							this._screen = createObject(DurabilityShopLayoutScreen);
						}
						// isDurabilityUnitItemInRestがtrueならユニットの所持品修理が出来るShopLayoutScreenForRestをセット
						else {
							this._screen = createObject(ShopLayoutScreenForRest);
						}
						this._screen.setScreenInteropData(screenParam.shopLayout.getShopInteropData());
						SceneManager.addScreen(this._screen, screenParam);
						return;
					}
				}
			}
		}
		alias00.call(this);
}




//-------------------------------------
// DurabilityChangeEventCommandクラス
//-------------------------------------
DurabilityChangeEventCommand._checkEventCommand= function() {
		// 元のままだとストックアイテムの耐久度が変更出来ない
		if (!this._isStockChange) {
			if (this._targetUnit === null || this._targetItem === null) {
				return false;
			}
		}
		else {
			if (this._targetItem === null) {
				return false;
			}
		}
		
		return this.isEventCommandContinue();
}




//-------------------------------------
// StockItemControlクラス
//-------------------------------------
StockItemControl.getMatchItem= function(targetItem) {
		var i, item;
		var count = this.getStockItemCount();
		
		for (i = 0; i < count; i++) {
			item = this.getStockItem(i);
			// 完全に一致しているかのチェックとしてitem === targetItemを追加
			// （これが無いと、同一種アイテムが複数ある時に動作が変になる）
			if (ItemControl.compareItem(item, targetItem) && item === targetItem) {
				return item;
			}
		}
		
		return null;
}




})();




//-------------------------------------
// DurabilityShopLayoutScreenクラス（派生）
//-------------------------------------
var DurabilityShopLayoutScreen = defineObject(ShopLayoutScreen,	// ShopLayoutScreenの派生
{
	
	_prepareScreenMemberData: function(screenParam) {
		// unitがnullの場合、売買ではストックアイテムが対象になる。
		// たとえば、購入時にはストックアイテムにアイテムが追加される。
		// 一方、unitがnullでない場合は、何らかのユニットが店を訪問したということで、ユニットアイテムが対象になる。
		// つまり、ユニットのアイテム欄にアイテムが追加される。
		this._targetUnit = screenParam.unit;
		
		this._shopLayout = screenParam.shopLayout;
		
		// 一度でも購入か売却を行うとtrue
		this._isSale = false;
		
		this._nextmode = 0;
		this._itemSale = createObject(DurabilityItemSale);
		this._itemSale.setParentShopScreen(this);
		
		this._shopItemArray = screenParam.itemArray;
		this._inventoryArray = screenParam.inventoryArray;
		this._buyItemWindow = createWindowObject(DurabilityItemWindow, this);
		this._sellItemWindow = createWindowObject(SellItemWindow, this);
		this._buySellWindow = createWindowObject(DurabilitySellWindow, this);
		this._buyQuestionWindow = createWindowObject(DurabilityQuestionWindow, this);
		this._sellQuestionWindow = createWindowObject(SellQuestionWindow, this);
		this._visitorSelectWindow = createWindowObject(VisitorSelectWindow, this);
		this._currencyWindow = createWindowObject(ShopCurrencyWindow, this);
		this._keeperWindow = createWindowObject(ShopMessageWindow, this);
		this._itemInfoWindow = createWindowObject(ItemInfoWindow, this);
		
		this._activeSelectWindow = this._buySellWindow;
		this._activeItemWindow = this._buyItemWindow;
		
		this._createShopMessageTable(this._shopLayout);
	},
	
	_moveBuySellSelect: function() {
		var result = this._buySellWindow.moveWindow();
			
		if (result === BuySellSelectResult.BUY) {
			// 修理可能アイテムを所持していれば修理へ（内部的には購入処理）
			if (this._buyItemWindow.getItemCount() > 0) {
				this._startMessage(this._shopMessageTable.QuestionBuy, ShopLayoutMode.BUY);
			}
			else {
				this._playOperationBlockSound();
			}
		}
		else if (result === BuySellSelectResult.SELL) {
			if (this._isStockSelectable()) {
				// ユニットまたはストックの選択に進む
				this._processMode(ShopLayoutMode.VISITORSELECT);
			}
			else {
				if (this._buySellWindow.isPossessionItem()) {
					this._startMessage(this._shopMessageTable.QuestionSell, ShopLayoutMode.SELL);
				}
				else {
					this._startMessage(this._shopMessageTable.NoItemBring, ShopLayoutMode.BUYSELLSELECT);
				}
			}
		}
		else if (result === BuySellSelectResult.CANCEL) {
			return MoveResult.END;
		}
		
		return MoveResult.CONTINUE;
	},
	
	_moveBuyQuestion: function() {
		var result = this._buyQuestionWindow.moveWindow();
		
		if (result === BuyQuestionResult.BUY) {
			// 「買う」が選択されたため、実際に購入する
			this._startSale(true, false);
			this._startMessage(this._shopMessageTable.EndBuy, ShopLayoutMode.BUY);
		}
		else if (result === BuyQuestionResult.CANCEL) {
			this._startMessage(this._shopMessageTable.QuestionBuy, ShopLayoutMode.BUY);
		}
		else if (result === BuyQuestionResult.NOGOLD) {
			this._startMessage(this._shopMessageTable.NoGold, ShopLayoutMode.BUY);
		}
		else if (result === BuyQuestionResult.ITEMFULL) {
			this._startMessage(this._shopMessageTable.ItemFull, ShopLayoutMode.BUY);
		}
		// 修理屋の場合、戻り値がBuyQuestionResult.NOSELLならば修理できないアイテムを指定された事になる。
		else if (result === BuyQuestionResult.NOSELL) {
			this._startMessage(this._shopMessageTable.NoSell, ShopLayoutMode.BUY);
		}
		
		return MoveResult.CONTINUE;
	},
	
	_startSale: function(isBuy, isForceStock) {
		var price = this._itemSale.startSale(isBuy, isForceStock, this._activeItemWindow.getShopSelectItem());
		
		// ゴールドを表示するウインドウの内容を変更する
		this._currencyWindow.startPriceCount(price);
		
		this._isSale = true;
		
		// 買ったときはアイテムを増やし、売ったときはアイテムを減らすから常に呼び出す
		this._sellItemWindow.updateItemArea();
		this._buyItemWindow.updateItemArea();
		
		this._playSaleSound();
	},
	
	_playOperationBlockSound: function() {
		MediaControl.soundDirect('operationblock');
	}
}
);




//-------------------------------------
// DurabilityItemSaleクラス（派生）
//-------------------------------------
var DurabilityItemSale = defineObject(ItemSale,		// ItemSaleの派生
{
	_parentShopScreen: null,
	
	startSale: function(isDurability, isForceStock, item) {
		var price = this._getPrice(isDurability, item);

		if (isDurability) {
			this._durabilityItem(item);
		}
		else {
			this._cutSellItem(item);
		}
		
		this._setPrice(price);
		
		return price;
	},
	
	_durabilityItem: function(item) {
		var unit = this._parentShopScreen.getVisitor();
		var increaseType = IncreaseType.ASSIGNMENT;
		var generator = root.getEventGenerator();
		var durability = item.getLimitMax();

		if( unit != null ) {
			generator.itemDurabilityChange(unit, item, durability, increaseType, isSkipDurability);
		}
		else {
			generator.stockDurabilityChange(item, durability, increaseType, isSkipDurability);
		}
		generator.execute();
	},

	_getPrice: function(isDurability, item) {
		var price;
		
		if (isDurability) {
			price = Calculator.calculateDurabilityPrice(item);
			price *= -1;
		}
		else {
			price = Calculator.calculateSellPrice(item);
		}
		
		return price;
	},

	_setPrice: function(price) {
		this._parentShopScreen.setGold(this._parentShopScreen.getGold() + price);
	}
}
);




//-------------------------------------
// DurabilitySellWindowクラス（派生）
//-------------------------------------
var DurabilitySellWindow = defineObject(BuySellWindow,	// BuySellWindowの派生
{
	moveWindowContent: function() {
		var input = this._scrollbar.moveInput();
		var result = BuySellSelectResult.NONE;
		
		if (input === ScrollbarInput.SELECT) {
			if (this._scrollbar.getIndex() === 0) {
				result = BuySellSelectResult.BUY;
			}
			else {
				result = BuySellSelectResult.SELL;
			}
		}
		else if (input === ScrollbarInput.CANCEL) {
			result = BuySellSelectResult.CANCEL;
		}
		else {
			result = BuySellSelectResult.NONE;
		}
		
		return result;
	},

	getSelectTextArray: function() {
		var arr = ['修理', StringTable.ShopLayout_SelectSell];
		return arr;
	}
}
);




//-------------------------------------
// DurabilityQuestionWindowクラス（派生）
//-------------------------------------
BuyQuestionResult.NOSELL = 999;	// 売れないアイテム（追加定義）
var DurabilityQuestionWindow = defineObject(BuyQuestionWindow,	// BuyQuestionWindowの派生
{
	moveWindowContent: function() {
		var input = this._scrollbar.moveInput();
		var result = BuyQuestionResult.NONE;
		
		if (input === ScrollbarInput.SELECT) {
			if (this._scrollbar.getIndex() === 0) {
				if (!this._isPriceOk()) {
					// 購入しようとしたが、ゴールドが足りなかった
					result = BuyQuestionResult.NOGOLD;
				}
				else if (!this._isItemRepairable()) {
					// 売れないアイテム（『修理できないアイテム』とする）
					result = BuyQuestionResult.NOSELL;
				}
				else if (this._isDurabilityMax()) {
					// アイテムが一杯（『耐久度が一杯』とする）
					result = BuyQuestionResult.ITEMFULL;
				}
				else {
					result = BuyQuestionResult.BUY;
				}
			}
			else {
				result = BuyQuestionResult.CANCEL;
			}
		}
		else if (input === ScrollbarInput.CANCEL) {
			result = BuyQuestionResult.CANCEL;
		}
		
		return result;
	},

	// 耐久度が最大値かどうか
	_isDurabilityMax: function() {
		var item = this.getParentInstance().getSelectItem();
		return (item.getLimitMax() == item.getLimit());
	},

	// お金が足りているか
	_isPriceOk: function() {
		var gold = this.getParentInstance().getGold();
		var item = this.getParentInstance().getSelectItem();
		var itemGold = Calculator.calculateDurabilityPrice(item);
		return gold >= itemGold;
	},

	// 修理可能なアイテムか
	_isItemRepairable: function() {
		var item = this.getParentInstance().getSelectItem();
		var unit = this.getParentInstance().getVisitor();

		return ItemControl._isItemRepairable(unit, item);
	}
}
);




//-------------------------------------
// DurabilityItemWindowクラス（派生）
//-------------------------------------
var DurabilityItemWindow = defineObject(SellItemWindow,	// SellItemWindowの派生
{
	getScrollbarObject: function() {
		return DurabilityScrollbar;
	},
	
	updateItemArea: function() {
		var i, item, count;
		var unit = this.getParentInstance().getVisitor();
		
		if (this._unit === unit) {
			this._scrollbar.saveScroll();
		}
		
		this._scrollbar.resetScrollData();
		
		if (unit !== null) {
			count = DataConfig.getMaxUnitItemCount();
			for (i = 0; i < count; i++) {
				item = UnitItemControl.getItem(unit, i);
				if (item !== null) {
					this._scrollbar.objectSet(item);
				}
			}
		}
		else {
			count = StockItemControl.getStockItemCount();
			for (i = 0; i < count; i++) {
				item = StockItemControl.getStockItem(i);
				if (item !== null) {
					this._scrollbar.objectSet(item);
				}
			}
		}
		
		this._scrollbar.objectSetEnd();
		this._scrollbar.resetAvailableData();
		
		// 売却先を変更していなければ、前回のスクロール位置を維持する
		if (this._unit === unit) {
			this._scrollbar.restoreScroll();
		}
		
		this._unit = unit;
	}
}
);




//-------------------------------------
// DurabilityScrollbarクラス（派生）
//-------------------------------------
var DurabilityScrollbar = defineObject(SellScrollbar,	// SellScrollbarの派生
{
	drawScrollContent: function(x, y, object, isSelect, index) {
		var textui = this.getParentTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		var item = object;

		// 修理可能なアイテムでなければアイテムを暗く表示
		if (!this._isItemRepairable(object)) {
			// 条件を満たしていないアイテムを薄暗くする
			color = ColorValue.DISABLE;
		}

		var gold = Calculator.calculateDurabilityPrice(item);

		ItemRenderer.drawShopItem(x, y, item, color, font, Calculator.calculateDurabilityPrice(item), 0);
	},

	// 修理可能なアイテムか
	_isItemRepairable: function(item) {
		var unit = this.getParentInstance().getParentInstance().getVisitor();

		return ItemControl._isItemRepairable(unit, item);
	}
}
);




//-------------------------------------
// Calculatorクラス
//-------------------------------------
// 耐久度回復の金額算出（買値の半分に、使用した耐久度の%をかけて算出する）
Calculator._weaponlist = null;	// ツールの武器リスト
Calculator._itemlist   = null;	// ツールの道具リスト

Calculator.calculateDurabilityPrice= function(item) {
		var d;
		var item_priginal;	// 本来のアイテム（破損時の武器が設定されていた場合の対策）

		// 武器リストが存在しない場合は取得
		if( Calculator._weaponlist == null ){
			Calculator._weaponlist = root.getBaseData().getWeaponList();
		}

		// 道具リストが存在しない場合は取得
		if( Calculator._itemlist == null ){
			Calculator._itemlist = root.getBaseData().getItemList();
		}

		if( item.isWeapon() == true ){
			// 破損時の武器が設定されている時があるので、IDを元にオリジナルの武器データを取り出す
			item_priginal = Calculator._weaponlist.getDataFromId(item.getId());
		}
		else {
			// 破損時の道具が設定されている時があるので、IDを元にオリジナルの道具データを取り出す
			item_priginal = Calculator._itemlist.getDataFromId(item.getId());
		}

		// 修理金額は買値の何%かを設定
		var repair_percent = repairPricePercent;
		if( repair_percent < 1 ) {
			repair_percent = 1;		// 1%未満が設定されていれば1%にする
		}

		// 修理金額算出
		var gold = item_priginal.getGold() *repair_percent / 100;
		
		if (item.getLimitMax() === 0) {
			d = 1;
		}
		else {
			// 残り耐久値の下限値は0とする（武器が破損する設定の場合、残り耐久度マイナスがありえるため）
			var limit = item.getLimit();
			if( limit < 0 ){
				limit = 0;
			}
			d = (item.getLimitMax() - limit) / item.getLimitMax();
		}
		
		gold = Math.floor(gold * d);
		return gold;
};




//-------------------------------------
// ItemControlクラス
//-------------------------------------
// 修理可能なアイテムか
ItemControl._isItemRepairable= function(unit, item) {
//		if (unit === null) {
//			return false;
//		}
		
		if (item.isWeapon()) {
			return true;
		}
		else if(item.isWand()) {
			return true;
		}
		// 武器タイプ追加の場合
		else if( typeof isWandTypeExtra !== 'undefined' ) {
			if( WandChecker.isWand(item) ) {
				return true;
			}
		}

		return false;
};




//-------------------------------------
// ShopLayoutScreenForRestクラス（派生）
//-------------------------------------
var ShopLayoutScreenForRest = defineObject(DurabilityShopLayoutScreen,
{
	
	_prepareScreenMemberData: function(screenParam) {
		// unitがnullの場合、売買ではストックアイテムが対象になる。
		// たとえば、購入時にはストックアイテムにアイテムが追加される。
		// 一方、unitがnullでない場合は、何らかのユニットが店を訪問したということで、ユニットアイテムが対象になる。
		// つまり、ユニットのアイテム欄にアイテムが追加される。
		this._targetUnit = screenParam.unit;
		
		this._shopLayout = screenParam.shopLayout;
		
		// 一度でも購入か売却を行うとtrue
		this._isSale = false;
		
		this._nextmode = 0;
		this._itemSale = createObject(ItemSaleForRest);
		this._itemSale.setParentShopScreen(this);
		
		this._shopItemArray = screenParam.itemArray;
		this._inventoryArray = screenParam.inventoryArray;
		this._buyItemWindow = createWindowObject(DurabilityItemWindowForRest, this);
		this._sellItemWindow = createWindowObject(SellItemWindow, this);
		this._buySellWindow = createWindowObject(DurabilitySellWindow, this);
		this._buyQuestionWindow = createWindowObject(DurabilityQuestionWindow, this);
		this._sellQuestionWindow = createWindowObject(SellQuestionWindow, this);
		this._visitorSelectWindow = createWindowObject(VisitorSelectWindow, this);
		this._currencyWindow = createWindowObject(ShopCurrencyWindow, this);
		this._keeperWindow = createWindowObject(ShopMessageWindow, this);
		this._itemInfoWindow = createWindowObject(ItemInfoWindow, this);
		
		this._activeSelectWindow = this._buySellWindow;
		this._activeItemWindow = this._buyItemWindow;
		
		this._createShopMessageTable(this._shopLayout);
	}
}
);




//-------------------------------------
// ItemSaleForRestクラス（派生）
//-------------------------------------
var ItemSaleForRest = defineObject(DurabilityItemSale,		// ItemSaleの派生
{
	_durabilityItem: function(item) {
		var unit = this._parentShopScreen.getVisitor();
		var increaseType = IncreaseType.ASSIGNMENT;
		var generator = root.getEventGenerator();
		var durability = item.getLimitMax();
		var durabilityUnit;

		if( unit != null ) {
			generator.itemDurabilityChange(unit, item, durability, increaseType, isSkipDurability);
		}
		else {
			durabilityUnit = this._parentShopScreen._activeItemWindow.getDurabilityUnit();
			
			if( durabilityUnit == null ) {
				generator.stockDurabilityChange(item, durability, increaseType, isSkipDurability);
			}
			else {
				generator.itemDurabilityChange(durabilityUnit, item, durability, increaseType, isSkipDurability);
			}
		}
		generator.execute();
	}
}
);




//-------------------------------------
// DurabilityItemWindowForRestクラス（派生）
//-------------------------------------
var DurabilityItemWindowForRest = defineObject(DurabilityItemWindow,
{
	getScrollbarObject: function() {
		return DurabilityScrollbarForRest;
	},
	
	getDurabilityUnit: function() {
		return this._scrollbar.getDurabilityUnit();
	},
	
	updateItemArea: function() {
		var i, item, count;
		var unit = this.getParentInstance().getVisitor();
		var durabilityUnit, list, j, unitCount;
		
		if (this._unit === unit) {
			this._scrollbar.saveScroll();
		}
		
		this._scrollbar.resetScrollData();
		
		if (unit !== null) {
			count = DataConfig.getMaxUnitItemCount();
			for (i = 0; i < count; i++) {
				item = UnitItemControl.getItem(unit, i);
				if (item !== null) {
					this._scrollbar.objectSet(item);
				}
			}
		}
		else {
			count = StockItemControl.getStockItemCount();
			for (i = 0; i < count; i++) {
				item = StockItemControl.getStockItem(i);
				// 拠点の場合、修理不可能な品は登録しない（ストック＋ユニットで凄い数になるので）
				if (item !== null && ItemControl._isItemRepairable(unit, item) === true) {
					this._scrollbar.objectSet(item);
					this._scrollbar.setDurabilityUnit(null);
				}
			}
			
			list = PlayerList.getAliveList();
			unitCount = list.getCount();
			for (j = 0; j < unitCount; j++) {
				durabilityUnit = list.getData(j);
				
				count = DataConfig.getMaxUnitItemCount();
				for (i = 0; i < count; i++) {
					item = UnitItemControl.getItem(durabilityUnit, i);
					// 拠点の場合、修理不可能な品は登録しない（ストック＋ユニットで凄い数になるので）
					if (item !== null && ItemControl._isItemRepairable(durabilityUnit, item) === true) {
						this._scrollbar.objectSet(item);
						this._scrollbar.setDurabilityUnit(durabilityUnit);
					}
				}
			}
		}
		
		this._scrollbar.objectSetEnd();
		this._scrollbar.resetAvailableData();
		
		// 売却先を変更していなければ、前回のスクロール位置を維持する
		if (this._unit === unit) {
			this._scrollbar.restoreScroll();
		}
		
		this._unit = unit;
	}
}
);




//-------------------------------------
// DurabilityScrollbarForRestクラス（派生）
//-------------------------------------
var DurabilityScrollbarForRest = defineObject(DurabilityScrollbar,
{
	_durabilityUnitArray: [],
	
	drawScrollContent: function(x, y, object, isSelect, index) {
		var textui = this.getParentTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		var item = object;
		var durabilityUnit = this.getDurabilityUnitFromIndex(index);
		
		if( durabilityUnit != null ) {
			this.drawUnitFace(x, y, durabilityUnit, RestDurabilityFaceAlpha);
		}
		
		// 修理可能なアイテムでなければアイテムを暗く表示
		if (!this._isItemRepairable(object)) {
			// 条件を満たしていないアイテムを薄暗くする
			color = ColorValue.DISABLE;
		}
		
		var gold = Calculator.calculateDurabilityPrice(item);
		
		ItemRenderer.drawShopItem(x, y, item, color, font, Calculator.calculateDurabilityPrice(item), 0);
	},
	
	getDurabilityUnit: function() {
		return this.getDurabilityUnitFromIndex(this.getIndex());
	},
	
	getDurabilityUnitFromIndex: function(index) {
		if (this._durabilityUnitArray === null || this._durabilityUnitArray.length === 0) {
			return null;
		}
		
		return this._durabilityUnitArray[index];
	},
	
	setDurabilityUnit: function(unit) {
		this._durabilityUnitArray.push(unit);
	},
	
	resetScrollData: function() {
		DurabilityScrollbar.resetScrollData.call(this);
		
		this._durabilityUnitArray = [];
	},
	
	drawUnitFace: function(x, y, unit, alpha) {
		var handle = unit.getFaceResourceHandle();
		var pic = GraphicsRenderer.getGraphics(handle, GraphicsType.FACE);
		
		if (pic === null) {
			return;
		}
		
		pic.setReverse(false);
		pic.setAlpha(alpha);
		
		this._drawShrinkFace(x + RestDurabilityFaceDrawXhosei, y + RestDurabilityFaceDrawYhosei, handle, pic);
	},
	
	_drawShrinkFace: function(xDest, yDest, handle, pic) {
		var xSrc, ySrc;
		var destWidth = RestDurabilityFaceDstWidth;
		var destHeight = RestDurabilityFaceDstHeight;
		var srcGettingWidth = RestDurabilityFaceGettingWidth;
		var srcGettingHeight = RestDurabilityFaceGettingHeight;
		var srcWidth = GraphicsFormat.FACE_WIDTH;
		var srcHeight = GraphicsFormat.FACE_HEIGHT;
		
		if (root.isLargeFaceUse() && pic.isLargeImage()) {
			srcWidth = root.getLargeFaceWidth();
			srcHeight = root.getLargeFaceHeight();
		}
		
		xSrc = handle.getSrcX() * srcWidth + RestDurabilityFaceSrcXHosei;
		ySrc = handle.getSrcY() * srcHeight + RestDurabilityFaceSrcYHosei;
		pic.drawStretchParts(xDest, yDest, destWidth, destHeight, xSrc, ySrc, srcGettingWidth, srcGettingHeight);
	}
}
);


