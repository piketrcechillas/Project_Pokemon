///*--------------------------------------------------------------------------
  
var MapChipSize          = 32;		// マップチップのサイズ（デフォルトはa32）
var isWalkMapWindowDisp  = true;	// 歩行マップ左下の顔ウィンドウを表示するか（true:表示する false:検出しない）




(function() {

//-------------------------------------------------------
// 設定
//-------------------------------------------------------
var isTalkFaceToFace     = false;	// 会話時相手の方を向くか（true:向く false:向かない）※true時UnitDirectionControl.jsが必要です

var isRTP_ChgSE          = true;	// ｃキーでの切替音にRTPのSEを使うか（true:RTPのSEを使う false:オリジナルSEを使う）
var use_ChgSE_ID         = 11;		// 切替時に鳴らすSEのID（デフォルトはID:11 RTPのアイテム使用音）

var MapStockCommandIndex = 0;		// ストックコマンドの位置（0:一番下、1以上の値:上から値番目）※-1ならストックコマンドを出しません
var MapUnitMarshalIndex  = -1;		// ユニット整理の位置（0:一番下、1以上の値:上から値番目）※-1ならユニット整理を出しません

var MoveSpeed            = 2;		// 移動の速さ（0:超速い[16dotずつ2回] 1:速い[8dotずつ4回] 2:通常[4dotずつ8回] 3:遅い[2dotずつ16回]）

var isSearchTalk         = false;	// 足元の会話イベントを検出するか（true:検出 false:検出しない）
var isSearchCustom       = true;	// 足元の場所イベント：カスタムを検出するか（true:検出 false:検出しない）
var isSearchTresure      = true;	// 足元の宝箱を検出するか（true:検出 false:検出しない）
var isSearchVillage      = true;	// 足元の村を検出するか（true:検出 false:検出しない）
var isSearchShop         = true;	// 足元の店を検出するか（true:検出 false:検出しない）
var isSearchGate         = false;	// 足元の扉を検出するか（true:検出 false:検出しない）
var isSearchInfo         = true;	// 足元の場所イベント：情報を検出するか（true:検出 false:検出しない）

var isSearchTalkDir      = true;	// 向いた先の会話イベントを検出するか（true:検出 false:検出しない）
var isSearchCustomDir    = true;	// 向いた先の場所イベント：カスタムを検出するか（true:検出 false:検出しない）
var isSearchTresureDir   = true;	// 向いた先の宝箱を検出するか（true:検出 false:検出しない）
var isSearchVillageDir   = false;	// 向いた先の村を検出するか（true:検出 false:検出しない）
var isSearchShopDir      = true;	// 向いた先の店を検出するか（true:検出 false:検出しない）
var isSearchGateDir      = true;	// 向いた先の扉を検出するか（true:検出 false:検出しない）
var isSearchInfoDir      = true;	// 向いた先の場所イベント：情報を検出するか（true:検出 false:検出しない）

var isAutoEventSilen     = false;	// サイレントモード。歩行マップの自動イベントチェックを減らすか（true:減らす false:通常）※シ○ンじゃないよ

var canTargetChange      = true;	// ｃキー押下でのキャラ切替（true:有効 false:無効）

var isScrollBGOnlyWalk   = true;	// フォグ表示でマップスクロールを考慮するか（true:歩行マップのみ考慮 false:歩行・通常マップ両方で考慮）




//-------------------------------------------------------
// 以下、プログラム
//-------------------------------------------------------
// プログラム用の設定

// 移動速度の定義（内部で使用）
var MoveFastest      = 0;		// 超速い（定義値）
var MoveFast         = 1;		// 速い（定義値）
var MoveNormal       = 2;		// 通常（定義値）
var MoveSlow         = 3;		// 遅い（定義値）

// 歩行グループ
var WalkGroup = {
	ALONE: 0,		// 通常（一体ずつ表示。切り替えた場合マップに出ている他の仲間の位置に切り替わる）
	GROUP: 1		// 先頭一体だけ表示。みんな一緒に行動
}


var isMovingSound    = false;	// 移動時の音が出るか（true:出る false:出ない）※trueにするとかなりうるさいです
var isUseTurnEnd     = false;	// ターン終了コマンドを出すか（true:出す false:出さない）※テスト用。弄らないで下さい




//-------------------------------------------
// ScriptExecuteEventCommandクラス
//-------------------------------------------
// WalkControl.changePlayerTurnWalk()を呼び出したイベントが重複し、かつ、
// 二番目およびそれ以降で実行されるイベントの中でメッセージが表示されている場合
// WalkControl.changePlayerTurnWalk()のコード実行がイベントコマンド呼び出し扱いになっている？らしい？？
var alias_ScriptExecuteEventCommand_moveEventCommandCycle = ScriptExecuteEventCommand.moveEventCommandCycle;
ScriptExecuteEventCommand.moveEventCommandCycle= function() {
		if( this._activeEventCommand === null ) {
			return MoveResult.END;
		}
		
		return alias_ScriptExecuteEventCommand_moveEventCommandCycle.call(this);
}


var alias_ScriptExecuteEventCommand_drawEventCommandCycle = ScriptExecuteEventCommand.drawEventCommandCycle;
ScriptExecuteEventCommand.drawEventCommandCycle= function() {
		if( this._activeEventCommand === null ) {
			return;
		}
		
		alias_ScriptExecuteEventCommand_drawEventCommandCycle.call(this);
}


var alias_ScriptExecuteEventCommand_isEventCommandSkipAllowed = ScriptExecuteEventCommand.isEventCommandSkipAllowed;
ScriptExecuteEventCommand.isEventCommandSkipAllowed= function() {
		if( this._activeEventCommand === null ) {
			return false;
		}
		
		return alias_ScriptExecuteEventCommand_isEventCommandSkipAllowed.call(this);
}




//-------------------------------------------
// LoadSaveScreenクラス
//-------------------------------------------
// セーブ時の保存用カスタムデータ作成
var alias_LoadSaveScreen_getCustomObject = LoadSaveScreen._getCustomObject;
LoadSaveScreen._getCustomObject= function() {
		var obj = alias_LoadSaveScreen_getCustomObject.call(this);
		
		// 保存データを作成
		obj.walkControlObject_ = WalkControl.createDataObject();
		
		return obj;
}


// ロード
var alias_LoadSaveScreen_executeLoad = LoadSaveScreen._executeLoad;
LoadSaveScreen._executeLoad= function() {
		var object = this._scrollbar.getObject();
		var walkControlObject_ = object.custom.walkControlObject_;
		
		// ロードファイルに独自データがあれば読み込む
		if( typeof walkControlObject_ !== 'undefined' ) {
			// データの更新
			WalkControl.updateDataObject(walkControlObject_);
		}
		
		alias_LoadSaveScreen_executeLoad.call(this);
}




//-------------------------------------------
// TitleCommandクラス
//-------------------------------------------
// タイトルで「初めから」を選択した場合はWalkControlクラスを初期化
var alias_TitleCommand_NewGame_createSubObject = TitleCommand.NewGame._createSubObject;
TitleCommand.NewGame._createSubObject= function() {
		alias_TitleCommand_NewGame_createSubObject.call(this);
		
		// WalkControlクラスの初期化
		WalkControl.resetData();
}




//-------------------------------------------
// FreeAreaSceneクラス
//-------------------------------------------
FreeAreaMode.TURNENDBYUNIT = 999;

var alias_FreeAreaScene_moveSceneCycle = FreeAreaScene.moveSceneCycle;
FreeAreaScene.moveSceneCycle= function() {
		var result = alias_FreeAreaScene_moveSceneCycle.call(this);
		
		var mode = this.getCycleMode();
		
		if (mode === FreeAreaMode.TURNENDBYUNIT) {
			result = this._moveTurnEndByUnit();
		}
		
		return result;
}


FreeAreaScene._moveTurnEndByUnit= function() {
		if (this._turnChangeEnd.moveTurnChangeCycle() !== MoveResult.CONTINUE) {
			root.getCurrentSession().setTurnType(TurnType.PLAYER);
			this._processMode(FreeAreaMode.TURNSTART);
		}
		
		return MoveResult.CONTINUE;
}


var alias_FreeAreaScene_prepareSceneMemberData = FreeAreaScene._prepareSceneMemberData;
FreeAreaScene._prepareSceneMemberData= function() {
		alias_FreeAreaScene_prepareSceneMemberData.call(this);
		
		this._playerTurnObject = createObject(WrapPlayerTurn);		// PlayerTurnではなく新規クラスに差し替え
		this._playerTurnObject.setupUsePlayerTurn();				// WrapPlayerTurnの、通常・町中設定関数呼び出し
}


var alias_FreeAreaScene_processMode = FreeAreaScene._processMode;
FreeAreaScene._processMode= function(mode) {
		alias_FreeAreaScene_processMode.call(this, mode);
		
		if (mode === FreeAreaMode.TURNENDBYUNIT) {
			if (this._turnChangeEnd.enterTurnChangeCycle() === EnterResult.NOTENTER) {
				root.getCurrentSession().setTurnType(TurnType.PLAYER);
				this._processMode(FreeAreaMode.TURNSTART);
			}
			else {
				this.changeCycleMode(mode);
			}
		}
}


FreeAreaScene.turnEndByUnit= function(isWalkMap) {
		this._processMode(FreeAreaMode.TURNENDBYUNIT);
}




//-------------------------------------------
// BattleSetupSceneクラス
//-------------------------------------------
var alias_BattleSetupScene_completeSceneMemberData = BattleSetupScene._completeSceneMemberData;
BattleSetupScene._completeSceneMemberData= function() {
		alias_BattleSetupScene_completeSceneMemberData.call(this);
		
		// マップID、歩行マップかどうか、歩行グループ：グループ/単独の状態をWalkControlに保持する
		var mapInfo = root.getCurrentSession().getCurrentMapInfo();
		var isWalkMap = mapInfo.custom.isWalkMap;
		var walkGroup = WalkGroup.ALONE;
		
		// マップIDをセット
		WalkControl.setMapId(mapInfo.getId());
		
		// 歩行マップかどうかをセット
		if(typeof isWalkMap === 'number' && isWalkMap === 1 ) {
			WalkControl.setWalkMap(true);
		}
		else {
			WalkControl.setWalkMap(false);
		}
		
		if(typeof mapInfo.custom.walkGroup === 'number') {
			walkGroup = mapInfo.custom.walkGroup;
		}
		
		// 歩行グループをセット
		WalkControl.setWalkGroup(walkGroup);
}




//-------------------------------------------
// BattleResultSceneクラス
//-------------------------------------------
var alias_BattleResultScene_completeSceneMemberData = BattleResultScene._completeSceneMemberData;
BattleResultScene._completeSceneMemberData= function() {
		alias_BattleResultScene_completeSceneMemberData.call(this);
		
		var unit, list, count, i;
		
		list = PlayerList.getMainList();
		count = list.getCount();
		
		// 自軍ユニットの向きを正面にする
		for (i = 0;i < count;i++) {
			unit = list.getData(i);
			if (unit === null) {
				continue;
			}
			
			unit.setDirection(DirectionType.NULL);
		}
}


var alias_BattleResultScene_drawSceneCycle = BattleResultScene.drawSceneCycle;
BattleResultScene.drawSceneCycle= function() {
		// 歩行マップの場合はユニットの移動範囲表示を消す
		if( WalkControl.isWalkMap() == true ) {
			MapLayer.drawUnitLayerByUnit();
			
			this._straightFlow.drawStraightFlow();
		}
		// 通常マップの場合は従来処理
		else {
			alias_BattleResultScene_drawSceneCycle.call(this);
		}
}




//-------------------------------------------
// BaseTurnChangeクラス
//-------------------------------------------
var alias_BaseTurnChange_enterEvent = BaseTurnChange._enterEvent;
BaseTurnChange._enterEvent= function() {
		// サイレントモードの場合、マップ開始時、ターン開始、ターン終了での自動開始イベントは実行されない
		// （条件：開始と終了を設定しているとサイレントモードでは実行されません）
		if( isAutoEventSilen === true ) {
			return EnterResult.NOTENTER;
		}
		
		return alias_BaseTurnChange_enterEvent.call(this);
}




//-------------------------------------------
// PlaceEventWrapperクラス
//-------------------------------------------
// 歩行時の場所イベント（ｚキーで調べる系）のラップ用クラス
var PlaceEventWrapper = defineObject(BaseObject,
{
	_groupArray: null,
	_groupArrayDir: null,
	_currentTarget: null,
	_eventOrner: null,
	_posX: -1,
	_posY: -1,
	
	initialize: function() {
		this._groupArray = [];
		this.configureCommands(this._groupArray);
		this._groupArrayDir = [];
		this.configureCommandsDir(this._groupArrayDir);
		this.rebuildCommand();
	},
	
	// 場所イベントの開始
	openEvent: function() {
		// 保持されたイベントが無い場合はfalseを返す
		if( this._eventOrner == null ) {
			return false;
		}
		
		// 保持されたイベントがあればopenしてtrueを返す
		this._eventOrner.openEvent();
		
		return true;
	},
	
	// 場所イベントの実施
	moveEvent: function() {
		var result = MoveResult.END;
		
		if( this._eventOrner != null ) {
			result = this._eventOrner.moveEvent();
			if (result !== MoveResult.CONTINUE) {
				this._eventOrner = null;
				this.resetSearchPos();
			}
		}
		
		return result;
	},
	
	// 場所イベントの描画
	drawEvent: function() {
		this._eventOrner.drawEvent();
	},
	
	// コマンドの再構築処理（現在は初期化時のみ実施）
	rebuildCommand: function() {
		var i, count;
		
		count = this._groupArray.length;
		for (i = 0; i < count; i++) {
			this._groupArray[i]._listManager = this;	// 各場所イベントにPlaceEventWrapperをセット
		}
		
		count = this._groupArrayDir.length;
		for (i = 0; i < count; i++) {
			this._groupArrayDir[i]._listManager = this;	// 各場所イベントにPlaceEventWrapperをセット
		}
	},
	
	// 場所イベントの検出
	isFindEvent: function() {
		var i, count;
		
		this._eventOrner = null;
		
		count = this._groupArray.length;
		for (i = 0; i < count; i++) {
			// 場所イベントが表示可能ならthis._eventOrnerに保持してtrueを返す
			if (this._groupArray[i].isEventDisplayable()) {
				this._eventOrner = this._groupArray[i];
				return true;
			}
		}
		
		// 表示可能な場所イベントがなければfalseを返す
		return false;
	},
	
	// 向いた方向の場所イベントの検出
	isFindEventDir: function() {
		var i, count;
		
		this._eventOrner = null;
		
		count = this._groupArrayDir.length;
		for (i = 0; i < count; i++) {
			// 場所イベントが表示可能ならthis._eventOrnerに保持してtrueを返す
			if (this._groupArrayDir[i].isEventDisplayable()) {
				this._eventOrner = this._groupArrayDir[i];
				return true;
			}
		}
		
		// 表示可能な場所イベントがなければfalseを返す
		return false;
	},
	
	// イベントの対象ユニットセット
	setListCommandUnit: function(unit) {
		this._currentTarget = unit;
	},
	
	// イベントの対象ユニット取得
	getListCommandUnit: function() {
		return this._currentTarget;
	},
	
	// 指定座標を保持（場所イベントの座標保持用）
	setSearchPos: function(x, y) {
		this._posX = x;
		this._posY = y;
	},
	
	// 座標のリセット
	resetSearchPos: function() {
		this._posX = -1;
		this._posY = -1;
	},
	
	// 座標の取得
	getSearchPos: function() {
		return createPos(this._posX, this._posY);
	},
	
	// 場所イベント群の登録（足元用）
	configureCommands: function(groupArray) {
		if( isSearchTalk === true ) {
			groupArray.appendObject(PlaceEventByUnit.Talk);				// 会話イベント
		}
		
		if( isSearchCustom === true ) {
			groupArray.appendObject(PlaceEventByUnit.PlaceCommand);		// 場所イベント：カスタム
		}
		
		if( isSearchTresure === true ) {
			groupArray.appendObject(PlaceEventByUnit.Treasure);			// 場所イベント：宝箱
		}
		
		if( isSearchVillage === true ) {
			groupArray.appendObject(PlaceEventByUnit.Village);			// 場所イベント：村
		}
		
		if( isSearchShop === true ) {
			groupArray.appendObject(PlaceEventByUnit.Shop);				// 場所イベント：店
		}
		
		if( isSearchGate === true ) {
			groupArray.appendObject(PlaceEventByUnit.Gate);				// 場所イベント：扉
		}
		
		if( isSearchInfo === true ) {
			groupArray.appendObject(PlaceEventByUnit.Information);		// 場所イベント：情報
		}
	},
	
	// 場所イベント群の登録（向いた方向用）
	configureCommandsDir: function(groupArray) {
		if( isSearchTalkDir === true ) {
			groupArray.appendObject(PlaceEventByUnit.Talk);				// 会話イベント
		}
		
		if( isSearchCustomDir === true ) {
			groupArray.appendObject(PlaceEventByUnit.PlaceCommand);		// 場所イベント：カスタム
		}
		
		if( isSearchTresureDir === true ) {
			groupArray.appendObject(PlaceEventByUnit.Treasure);			// 場所イベント：宝箱
		}
		
		if( isSearchVillageDir === true ) {
			groupArray.appendObject(PlaceEventByUnit.Village);			// 場所イベント：村
		}
		
		if( isSearchShopDir === true ) {
			groupArray.appendObject(PlaceEventByUnit.Shop);				// 場所イベント：店
		}
		
		if( isSearchGateDir === true ) {
			groupArray.appendObject(PlaceEventByUnit.Gate);				// 場所イベント：扉
		}
		
		if( isSearchInfoDir === true ) {
			groupArray.appendObject(PlaceEventByUnit.Information);		// 場所イベント：情報
		}
	}
}
);




//-------------------------------------------
// BasePlaceEventByUnitクラス
//-------------------------------------------
// 場所イベント群の基本クラス
var BasePlaceEventByUnit = defineObject(BaseObject,
{
	_listManager: null,
	
	initialize: function() {
	},
	
	openEvent: function() {
	},
	
	moveEvent: function() {
		return MoveResult.END;
	},
	
	drawEvent: function() {
	},
	
	isEventDisplayable: function() {
		return false;
	},
	
	getCommandTarget: function() {
		return this._listManager.getListCommandUnit();
	},
	
	endCommandAction: function() {
	},
	
	getSearchPos: function() {
		return this._listManager.getSearchPos();
	},
	
	_getEventType: function() {
		return PlaceEventType.WAIT;
	},
	
	_getPlaceEventFromPos: function(type, x, y) {
		return PosChecker.getPlaceEventFromPos(type, x, y);
	},
	
	_getEvent: function() {
		if( this._getEventType() === PlaceEventType.WAIT ){
			return null;
		}
		
		var pos = this.getSearchPos();
		if( pos.x === -1 || pos.y === -1 ) {
			return null;
		}
		
		return this._getPlaceEventFromPos(this._getEventType(), pos.x, pos.y);
	}
}
);


//-------------------------------------------
// 以下は場所イベント群
//-------------------------------------------
var PlaceEventByUnit = {};


//-------------------------------------------
// 場所イベント：カスタム
//-------------------------------------------
PlaceEventByUnit.Information = defineObject(BasePlaceEventByUnit,
{
	_capsuleEvent: null,
	
	openEvent: function() {
		this._prepareCommandMemberData();
		this._completeCommandMemberData();
	},
	
	moveEvent: function() {
		var result = MoveResult.CONTINUE;
		
		if (this._capsuleEvent.moveCapsuleEvent() !== MoveResult.CONTINUE) {
			this.endCommandAction();
			return MoveResult.END;
		}
		
		return result;
	},
	
	isEventDisplayable: function() {
		var event = this._getEvent();
		
		return event !== null && event.isEvent();
	},
	
	_prepareCommandMemberData: function() {
		this._capsuleEvent = createObject(CapsuleEvent);
	},
	
	_completeCommandMemberData: function() {
		var event = this._getEvent();
		
		// 実行済みにならないようにfalseを指定
		this._capsuleEvent.enterCapsuleEvent(event, false);
	},
	
	_getEventType: function() {
		return PlaceEventType.INFORMATION;
	}
}
);


//-------------------------------------------
// 場所イベント：村
//-------------------------------------------
PlaceEventByUnit.Village = defineObject(BasePlaceEventByUnit,
{
	_eventTrophy: null,
	
	openEvent: function() {
		this._prepareCommandMemberData();
		this._completeCommandMemberData();
	},
	
	moveEvent: function() {
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;
		
		if (this._eventTrophy.moveEventTrophyCycle() !== MoveResult.CONTINUE) {
			this.endCommandAction();
			return MoveResult.END;
		}
		
		return result;
	},
	
	drawEvent: function() {
		this._eventTrophy.drawEventTrophyCycle();
	},
	
	isEventDisplayable: function() {
		var event = this._getEvent();
		
		return event !== null && event.isEvent() && event.getExecutedMark() === EventExecutedType.FREE;
	},
	
	_prepareCommandMemberData: function() {
		this._eventTrophy = createObject(EventTrophy);
	},
	
	_completeCommandMemberData: function() {
		var event = this._getEvent();
		
		this._eventTrophy.enterEventTrophyCycle(this.getCommandTarget(), event);
	},
	
	_getEventType: function() {
		return PlaceEventType.VILLAGE;
	}
}
);


//-------------------------------------------
// 場所イベント：店
//-------------------------------------------
var ShopCommandByUnitMode = {
	EVENT: 0,
	SCREEN: 1
};

PlaceEventByUnit.Shop = defineObject(BasePlaceEventByUnit,
{
	_capsuleEvent: null,
	_shopLayoutScreen: null,
	
	openEvent: function() {
		this._prepareCommandMemberData();
		this._completeCommandMemberData();
	},
	
	moveEvent: function() {
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;
		
		if (mode === ShopCommandByUnitMode.EVENT) {
			result = this._moveTop();
		}
		else if (mode === ShopCommandByUnitMode.SCREEN) {
			result = this._moveScreen();
		}
		
		return result;
	},
	
	isEventDisplayable: function() { 
		var event = this._getEvent();
		
		return event !== null && event.isEvent() && Miscellaneous.isItemAccess(this.getCommandTarget());
	},
	
	_prepareCommandMemberData: function() {
		this._capsuleEvent = createObject(CapsuleEvent);
	},
	
	_completeCommandMemberData: function() {
		var event = this._getEvent();
		
		// 実行済みにならないようにfalseを指定
		this._capsuleEvent.enterCapsuleEvent(event, false);
		this.changeCycleMode(ShopCommandByUnitMode.EVENT);
	},
	
	_moveTop: function() {
		var screenParam;
		var event = this._getEvent();
		
		if (this._capsuleEvent.moveCapsuleEvent() !== MoveResult.CONTINUE) {
			screenParam = this._createScreenParam();
			if( typeof event.custom.Durability === 'number' && typeof DurabilityShopLayoutScreen !== 'undefined' ){
				this._shopLayoutScreen = createObject(DurabilityShopLayoutScreen);
			}
			else{
				this._shopLayoutScreen = createObject(ShopLayoutScreen);
			}
			this._shopLayoutScreen.setScreenInteropData(screenParam.shopLayout.getShopInteropData());
			SceneManager.addScreen(this._shopLayoutScreen, screenParam);
			
			this.changeCycleMode(ShopCommandByUnitMode.SCREEN);
		}
		
		return MoveResult.CONTINUE;
	},
	
	_moveScreen: function() {
		if (SceneManager.isScreenClosed(this._shopLayoutScreen)) {
			if (this._shopLayoutScreen.getScreenResult() === ShopLayoutResult.ACTION) {
				this.endCommandAction();
			}
			
			return MoveResult.END;
		}
		
		return MoveResult.CONTINUE;
	},
	
	_getEventType: function() {
		return PlaceEventType.SHOP;
	},
	
	_createScreenParam: function() {
		var screenParam = ScreenBuilder.buildShopLayout();
		var shopData = this._getEvent().getPlaceEventInfo().getShopData();
		
		screenParam.unit = this.getCommandTarget();
		screenParam.itemArray = shopData.getShopItemArray();
		screenParam.inventoryArray = shopData.getInventoryNumberArray();
		screenParam.shopLayout = shopData.getShopLayout();
		
		return screenParam;
	}
}
);


//-------------------------------------------
// 場所イベント：扉
//-------------------------------------------
PlaceEventByUnit.Gate = defineObject(BasePlaceEventByUnit,
{
	_keyData: null,
	_keyNavigator: null,
	
	openEvent: function() {
		this._prepareCommandMemberData();
		this._completeCommandMemberData();
	},
	
	moveEvent: function() {
		if (this._keyNavigator.moveKeyNavigator() !== MoveResult.CONTINUE) {
			if (this._keyNavigator.isUsed()) {
				this.endCommandAction();
			}
			return MoveResult.END;
		}
		
		return MoveResult.CONTINUE;
	},
	
	drawEvent: function() {
		this._keyNavigator.drawKeyNavigator();
	},
	
	isEventDisplayable: function() {
		var skill, item, pos, event;
		var requireFlag = KeyFlag.GATE;
		var unit = this.getCommandTarget();
		
		this._keyData = null;
		
		skill = SkillControl.getPossessionSkill(unit, SkillType.PICKING);
		if (skill !== null) {
			this._keyData = KeyEventChecker.buildKeyDataSkill(skill, requireFlag);
		}
		
		if (this._keyData === null) {
			item = ItemControl.getKeyItem(unit, requireFlag);
			if (item !== null) {
				this._keyData = KeyEventChecker.buildKeyDataItem(item, requireFlag);
			}
		}
		
		if (this._keyData === null) {
			return false;
		}
		
		pos = this.getSearchPos();
		event = KeyEventChecker.getKeyEvent(pos.x, pos.y, this._keyData);
		
		return event !== null && event.isEvent() && event.getExecutedMark() === EventExecutedType.FREE;
	},
	
	_prepareCommandMemberData: function() {
		this._keyNavigator = createObject(KeyNavigatorByUnit);
	},
	
	_completeCommandMemberData: function() {
		var pos = this.getSearchPos();
		this._keyNavigator.openKeyNavigatorByUnit(this.getCommandTarget(), this._keyData, pos.x, pos.y);
	}
}
);


//-------------------------------------------
// 場所イベント：宝箱
//-------------------------------------------
PlaceEventByUnit.Treasure = defineObject(BasePlaceEventByUnit,
{
	_keyData: null,
	_keyNavigator: null,
	
	openEvent: function() {
		this._prepareCommandMemberData();
		this._completeCommandMemberData();
	},
	
	moveEvent: function() {
		if (this._keyNavigator.moveKeyNavigator() !== MoveResult.CONTINUE) {
			if (this._keyNavigator.isUsed()) {
				this.endCommandAction();
			}
			return MoveResult.END;
		}
		
		return MoveResult.CONTINUE;
	},
	
	drawEvent: function() {
		this._keyNavigator.drawKeyNavigator();
	},
	
	isEventDisplayable: function() {
		var skill, item, pos, event;
		var requireFlag = KeyFlag.TREASURE;
		var unit = this.getCommandTarget();
		
		this._keyData = null;
		
		if (!DataConfig.isTreasureKeyEnabled()) {
			this._keyData = KeyEventChecker.buildKeyDataDefault();
		}
		
		if (this._keyData === null) {
			skill = SkillControl.getPossessionSkill(unit, SkillType.PICKING);
			if (skill !== null) {
				this._keyData = KeyEventChecker.buildKeyDataSkill(skill, requireFlag);
			}
		}
		
		if (this._keyData === null) {
			item = ItemControl.getKeyItem(unit, requireFlag);
			if (item !== null) {
				this._keyData = KeyEventChecker.buildKeyDataItem(item, requireFlag);
			}
		}
		
		if (this._keyData === null) {
			return false;
		}
		
		pos = this.getSearchPos();
		event = KeyEventChecker.getKeyEvent(pos.x, pos.y, this._keyData);
		
		return event !== null && event.isEvent() && event.getExecutedMark() === EventExecutedType.FREE;
	},
	
	_prepareCommandMemberData: function() {
		this._keyNavigator = createObject(KeyNavigatorByUnit);
	},
	
	_completeCommandMemberData: function() {
		var pos = this.getSearchPos();
		this._keyNavigator.openKeyNavigatorByUnit(this.getCommandTarget(), this._keyData, pos.x, pos.y);
	}
}
);


//-------------------------------------------
// KeyNavigatorByUnitクラス（一致するカギを検出。扉と宝箱で使用）
//-------------------------------------------
var KeyNavigatorByUnit = defineObject(KeyNavigator,
{
	openKeyNavigatorByUnit: function(unit, keyData, x, y) {
		this._prepareMemberData(unit, keyData);
		this._completeMemberDataByUnit(unit, keyData, x, y);
	},
	
	_completeMemberDataByUnit: function(unit, keyData, x, y) {
		this._straightFlow.setStraightFlowData(this);
		this._pushFlowEntries(this._straightFlow);
		
		this._isUsed = true;
		this._placeEvent = KeyEventChecker.getKeyEvent(x, y, keyData);
		this._straightFlow.enterStraightFlow();
		this.changeCycleMode(KeyNavigatorMode.FLOW);
	}
}
);


//-------------------------------------------
// 場所イベント：カスタム
//-------------------------------------------
PlaceEventByUnit.PlaceCommand = defineObject(BasePlaceEventByUnit,
{
	_capsuleEvent: null,
	
	openEvent: function() {
		this._prepareCommandMemberData();
		this._completeCommandMemberData();
	},
	
	moveEvent: function() {
		var result = MoveResult.CONTINUE;
		
		if (this._capsuleEvent.moveCapsuleEvent() !== MoveResult.CONTINUE) {
			this.endCommandAction();
			return MoveResult.END;
		}
		
		return result;
	},
	
	isEventDisplayable: function() {
		var event = this._getEvent();
		
		return event !== null && event.isEvent() && event.getPlaceEventInfo().getPlaceCustomType() === PlaceCustomType.COMMAND;
	},
	
	_prepareCommandMemberData: function() {
		this._capsuleEvent = createObject(CapsuleEvent);
	},
	
	_completeCommandMemberData: function() {
		var event = this._getEvent();
		
		this._capsuleEvent.enterCapsuleEvent(event, true);
	},
	
	_getEventType: function() {
		return PlaceEventType.CUSTOM;
	},
	
	// 場所イベント：カスタムは何回でも実施されるので同じように動作させている
	_getPlaceEventFromPos: function(type, x, y) {
		var i, event, placeInfo;
		var list = root.getCurrentSession().getPlaceEventList();
		var count = list.getCount();
		
		for (i = 0; i < count; i++) {
			event = list.getData(i);
			placeInfo = event.getPlaceEventInfo();
			if (placeInfo.getPlaceEventType() === type) {
				if (placeInfo.getX() === x && placeInfo.getY() === y) {
					return event;
				}
			}
		}
		
		return null;
	}
}
);


//-------------------------------------------
// 会話イベント
//-------------------------------------------
PlaceEventByUnit.Talk = defineObject(BasePlaceEventByUnit,
{
	_capsuleEvent: null,
	_text: null,
	
	openEvent: function() {
		this._prepareCommandMemberData();
		this._completeCommandMemberData();
	},
	
	moveEvent: function() {
		var result = this._moveEventMode();
		
		return result;
	},
	
	drawEvent: function() {
	},
	
	isEventDisplayable: function() {
		var event;
		var pos = this.getSearchPos();
		var unit = this.getCommandTarget();
		
		// 座標が自分自身の位置と等しい場合はfalse（自分の会話イベントを探してしまうので）
		if( pos.x === unit.getMapX() && pos.y === unit.getMapY() ) {
			return false;
		}
		
		event = this._getTargetEventFromPos(pos.x, pos.y);
		
		return event !== null && event.isEvent() && event.getExecutedMark() === EventExecutedType.FREE;
	},
	
	endCommandAction: function() {
		var unit, dest, pos;
		
		if( isTalkFaceToFace && typeof UnitDirectionControl !== 'undefined' ) {
//			unit = this.getCommandTarget();
//			if( unit != null ) {
//				unit.setDirection(DirectionType.NULL);
//			}
			
			pos = this.getSearchPos();
			dest = PosChecker.getUnitFromPos(pos.x, pos.y);
			if( dest != null ) {
				dest.setDirection(DirectionType.NULL);
			}
		}
	},
	
	_prepareCommandMemberData: function() {
		this._capsuleEvent = createObject(CapsuleEvent);
	},
	
	_completeCommandMemberData: function() {
		var unit, dest;
		var pos = this.getSearchPos();
		var event = this._getTargetEventFromPos(pos.x, pos.y);
		this._capsuleEvent.enterCapsuleEvent(event, true);

		if( isTalkFaceToFace && typeof UnitDirectionControl !== 'undefined' ) {
			unit = this.getCommandTarget();
			dest = PosChecker.getUnitFromPos(pos.x, pos.y);

			UnitDirectionControl._setUnitDirecion(unit, dest, DirCtrlValue.FACE);
			UnitDirectionControl._setUnitDirecion(dest, unit, DirCtrlValue.FACE);
		}
	},
	
	_moveEventMode: function() {
		if (this._capsuleEvent.moveCapsuleEvent() !== MoveResult.CONTINUE) {
			this.endCommandAction();
			return MoveResult.END;
		}
		
		return MoveResult.CONTINUE;
	},
	
	_getTalkEvent: function(unit, targetUnit) {
		var i, event, talkInfo, src, dest, isEqual;
		var arr = EventCommonArray.createArray(root.getCurrentSession().getTalkEventList(), EventType.TALK);
		var count = arr.length;
		
		for (i = 0; i < count; i++) {
			event = arr[i];
			talkInfo = event.getTalkEventInfo();
			src = talkInfo.getSrcUnit();
			dest = talkInfo.getDestUnit();
			
			isEqual = false;
			
			if (unit === src && targetUnit === dest) {
				isEqual = true;
			}
			else if (talkInfo.isMutual()) {
				if (unit === dest && targetUnit === src) {
					isEqual = true;
				}
			}
			
			if ( isEqual === true ) {
				if (event.isEvent() && event.getExecutedMark() === EventExecutedType.FREE) {
					return event;
				}
			}
		}
		
		return null;
	},
	
	_getTargetEventFromPos : function(x, y) {
		var unit = this.getCommandTarget();
		var targetUnit = PosChecker.getUnitFromPos(x, y);
		
		if (targetUnit === null) {
			return null;
		}
		
		return this._getTalkEvent(unit, targetUnit);
	}
}
);




//-------------------------------------------
// MapCursorクラス
//-------------------------------------------
MapCursor.isFindEvent= function() {
		return false;
}

MapCursor.openEvent= function() {
		return false;
}


MapCursor.isMapCommandDisplayable= function() {
		return false;
}


MapCursor.getWalkGroup= function() {
		return WalkGroup.ALONE;
}


MapCursor.isWalkGroup= function() {
		return false;
}


MapCursor.setWalkGroup= function(mode) {
}


MapCursor.invisibleGroup= function() {
}


MapCursor.findNextUnit= function() {
}


MapCursor.setFrontUnit= function(unitid) {
}




//-------------------------------------------
// MapCursorByUnitクラス
//-------------------------------------------
var MapCursorByUnitMode = {
	NONE: 0,		// 移動キー受付
	SLIDE: 1,		// 移動途中
	DELAY: 2,		// 向きを変えた状態
	WAITEVENT: 3,	// 場所イベント（待機）実施中
	PLACEEVENT: 4	// 場所イベント（待機以外）実施中
};


// 指定のユニットを操作してる感じのMapCursor
var MapCursorByUnit = defineObject(MapCursor,
{
	_isInputEnabled: true,
	_unitSlideCursor: null,
	_unit: null,
	_posLog: [],			// ユニットの位置（現在未使用）
	_dir: DirectionType.NULL,
	_mapLineScroll: null,
	_capsuleEvent: null,
	_placeEventWrapper: null,
	_preMode: MapCursorByUnitMode.NONE,
	_activeIndex: 0,
	_walkGroup: WalkGroup.ALONE,
	
	initialize: function() {
		this._capsuleEvent = createObject(CapsuleEvent);
		this._unitSlideCursor = createObject(UnitSlideCursor);
		this._mapLineScroll = createObject(MapLineScrollByUnit);
		this._placeEventWrapper = createObject(PlaceEventWrapper);
		
		this.changeCycleMode(MapCursorByUnitMode.NONE);
		
		this._dir = DirectionType.NULL;
	},
	
	setUnit: function(unit) {
		this._unit = unit;
	},
	
	getUnit: function() {
		return this._unit;
	},
	
	setActiveIndex: function(index) {
		this._activeIndex = index;
	},
	
	getActiveIndex: function() {
		return this._activeIndex;
	},
	
	getWalkGroup: function() {
		return this._walkGroup;
	},
	
	isWalkGroup: function() {
		return (this._walkGroup === WalkGroup.GROUP);
	},
	
	setWalkGroup: function(mode) {
		this._walkGroup = mode;
	},
	
	// 現在の先頭ユニット以外は非表示にする
	invisibleWalkGroup: function() {
		var unit, list, count, i;
		var nowUnit = this.getUnit();
		
		list = PlayerList.getSortieList();
		count = list.getCount();
		
		for (i = 0;i < count;i++) {
			unit = list.getData(i);
			if (unit === null) {
				continue;
			}
			
			if (unit === nowUnit) {
				continue;
			}
			
			unit.setInvisible(true);
		}
	},
	
	findNextUnit: function() {
		var nowUnit = this.getUnit();
		
		if( nowUnit.getAliveState() !== AliveType.ALIVE ) {
			var unit;
			
			var list = PlayerList.getSortieList();
			var count = list.getCount();
			var index = this._activeIndex;
			
			for (;;) {
				unit = list.getData(index);
				if (unit !== null) {
					if (unit.getAliveState() === AliveType.ALIVE)  {
						this._activeIndex = index;
						this.setNextUnit(unit);
						break;
					}
				}
				
				index++;
				
				if (index >= count) {
					index = 0;
				}
				else if (index < 0) {
					index = count - 1;
				}
				
				if (index === this._activeIndex) {
					break;
				}
			}
		}
		else {
			this.setNextUnit(nowUnit);
		}
	},
	
	setFrontUnit: function(unitid) {
		var unit;
		var nowUnit = this.getUnit();
		var list = PlayerList.getSortieList();
		var count = list.getCount();
		var index = 0;
		
		for (index = 0;index < count;index++) {
			unit = list.getData(index);
			if ( unit !== null && unit.getId() === unitid ) {
				this._activeIndex = index;
				this.setNextUnit(unit);
				
				// 先頭ユニットが切り替わる場合、元の先頭ユニットは正面を向く
				if( unit !== nowUnit ) {
					nowUnit.setDirection(DirectionType.NULL);
				}
				break;
			}
		}
	},
	
	moveCursor: function() {
		var event;
		var mode = this.getCycleMode();
		var inputType = InputType.NONE;
		var unit = this.getUnit();
		
		this._mapLineScroll.moveLineScroll();
		
		if( mode === MapCursorByUnitMode.NONE ) {
			inputType = this._getDirectionInputType();
			
			inputType = this._changeCursorValue(inputType);
			if( inputType === InputType.NONE ) {
				inputType = this._changeCursorValue(WalkControl.changeCursorValueFromMouse(unit));
			}
			
			if( inputType !== InputType.NONE ) {
				this._dir = this._cnvInputTypeToDir(inputType);
				this._unitSlideCursor.setSlideData(unit, this._dir, MoveSpeed);
				this.changeCycleMode(MapCursorByUnitMode.SLIDE);
			}
			// 向きだけ変えた場合、キーを離すのを待つ
			else if( this._dir !== DirectionType.NULL ){
//			else if( unit.getDirection() !== DirectionType.NULL ){
//				this._dir = unit.getDirection();
				this.changeCycleMode(MapCursorByUnitMode.DELAY);
			}
		}
		// スライド中の処理
		else if( mode === MapCursorByUnitMode.SLIDE ) {
			if( this._unitSlideCursor.moveSlideCycle() !== MoveResult.CONTINUE ) {
				this._unitSlideCursor.endSlideCycle();

				// ここで足元をチェック
				event = this._getWaitEvent(unit);
				
				// 場所イベント（待機）があれば方向：なしに
				// （そのままマップクリアすると向きが正面にならないのでここで一旦正面にしている）
				if (event !== null) {
					unit.setDirection(DirectionType.NULL);
				}
				
				if (event !== null && this._capsuleEvent.enterCapsuleEvent(event, true) === EnterResult.OK ) {
					// 場所イベント（待機）があれば実施へ
					this.changeCycleMode(MapCursorByUnitMode.WAITEVENT);
				}
				else {
					// 自動イベントのチェック処理を呼び出す
					WalkControl.notifyAutoEventCheck();
					
					// 終わったらキー受付に戻る
					this.changeCycleMode(MapCursorByUnitMode.NONE);
				}
			}
		}
		// 向きだけ変えた場合の処理（キーを離すのをチェック）
		else if( mode === MapCursorByUnitMode.DELAY ) {
			// 直接キーを見る
			inputType = this._getDirectionInputType();
			
			if( inputType === InputType.NONE || this._dir !== this._cnvInputTypeToDir(inputType) ) {
				// 向きを元に戻す
//				unit.setDirection(DirectionType.NULL);
				this._dir = DirectionType.NULL;
				this.changeCycleMode(MapCursorByUnitMode.NONE);
			}
		}
		// 待機イベント実施中の処理
		else if( mode === MapCursorByUnitMode.WAITEVENT ) {
			if (this._capsuleEvent.moveCapsuleEvent() !== MoveResult.CONTINUE) {
				// イベント終了時にユニット座標をカーソル位置にセットし、カーソル位置とユニット位置を合わせる
				// （イベントコマンドでユニットを移動させた場合、カーソルとユニットの位置がずれる為）
				var session = root.getCurrentSession();
				var xCursor = unit.getMapX();
				var yCursor = unit.getMapY();
				
				session.setMapCursorX(xCursor);
				session.setMapCursorY(yCursor);
				
				// 自動イベントのチェック処理を呼び出す
				WalkControl.notifyAutoEventCheck();
				
				// 終わったらキー受付に戻る
				this.changeCycleMode(MapCursorByUnitMode.NONE);
			}
		}
		
		// それ以外（場所イベント実施中など）
		else {
		}
		
		return inputType;
	},
	
	moveCursorAnimation: function() {
		return MoveResult.CONTINUE;
	},
	
	drawCursor: function() {
		var mode = this.getCycleMode();
		
		if( mode === mode === MapCursorByUnitMode.SLIDE ) {
			// スライド中の処理
			this._unitSlideCursor.drawSlideCycle();
		}
	},
	
	getUnitFromCursor: function() {
		var mode = this.getCycleMode();
		
		// 移動途中、場所イベント（待機）実施中、場所イベント（待機以外）実施中ならばnullを返す
		if( mode === MapCursorByUnitMode.SLIDE || 
			mode === MapCursorByUnitMode.WAITEVENT || 
			mode === MapCursorByUnitMode.PLACEEVENT ) {
			
			return null;
		}
		
		// 上下左右キーが入っていればnullを返す
		if( this._getDirectionInputType() !== InputType.NONE ) {
			return null;
		}
		
		return MapCursor.getUnitFromCursor.call(this);
	},
	
	isFindEvent: function() {
		var isFind;
		var unit = this.getUnit();
		var x = unit.getMapX();
		var y = unit.getMapY();
		var dir = unit.getDirection();
		
		// 足元を調べる
		this._placeEventWrapper.setListCommandUnit(unit);
		this._placeEventWrapper.setSearchPos(x, y);
		isFind = this._placeEventWrapper.isFindEvent();
		
		if( isFind === true ) {
			return isFind;
		}
		
		if( dir === DirectionType.NULL ) {
			return isFind;
		}
		
		x += XPoint[dir];
		y += YPoint[dir];
		
		// 向いた先を調べる
		this._placeEventWrapper.setSearchPos(x, y);
		isFind = this._placeEventWrapper.isFindEventDir();
		return isFind;
	},
	
	openEvent: function() {
		var result;
		var mode = this.getCycleMode();
		
		// 移動途中、場所イベント（待機）実施中、場所イベント（待機以外）実施中ならば実施出来ない
		if( mode === MapCursorByUnitMode.SLIDE || 
			mode === MapCursorByUnitMode.WAITEVENT || 
			mode === MapCursorByUnitMode.PLACEEVENT ) {
			
			return false;
		}
		
		result = this._placeEventWrapper.openEvent();
		
		if( result === true ) {
			this._preMode = mode;
			this.changeCycleMode(MapCursorByUnitMode.PLACEEVENT);
		}
		
		return result;
	},
	
	isMapCommandDisplayable: function() {
		var mode = this.getCycleMode();
		
		// 移動途中、場所イベント（待機）実施中、場所イベント（待機以外）実施中ならばマップコマンドは実施出来ない
		if( mode === MapCursorByUnitMode.SLIDE || 
			mode === MapCursorByUnitMode.WAITEVENT || 
			mode === MapCursorByUnitMode.PLACEEVENT ) {
			
			return false;
		}
		
		// 上下左右キーが入っていれば実施出来ない
		if( this._getDirectionInputType() !== InputType.NONE ) {
			return false;
		}
		
		return true;
	},
	
	moveEvent: function() {
		var result = this._placeEventWrapper.moveEvent();
		
		if (result !== MoveResult.CONTINUE) {
			this.changeCycleMode(this._preMode);
		}
		
		return result;
	},
	
	changeTarget: function() {
		var unit, list, count, index, nowUnit;
		var mode = this.getCycleMode();
		
		// 移動途中、場所イベント（待機）実施中、場所イベント（待機以外）実施中ならば実施出来ない
		if( mode === MapCursorByUnitMode.SLIDE || 
			mode === MapCursorByUnitMode.DELAY || 
			mode === MapCursorByUnitMode.WAITEVENT || 
			mode === MapCursorByUnitMode.PLACEEVENT ) {
			
			return;
		}
		
		// 上下左右キーが入っていれば実施出来ない
		if( this._getDirectionInputType() !== InputType.NONE ) {
			return;
		}
		
		nowUnit = this.getUnit();
		nowUnit.setDirection(DirectionType.NULL);
		list = PlayerList.getSortieList();
		count = list.getCount();
		index = this._activeIndex;
		
		for (;;) {
			index++;
			
			if (index >= count) {
				index = 0;
			}
			else if (index < 0) {
				index = count - 1;
			}
			
			unit = list.getData(index);
			if (unit === null) {
				break;
			}
			
			if (!unit.isWait() && nowUnit !== unit)  {
				this._activeIndex = index;
				this.setNextUnit(unit);
				this._playChangeSound();
				break;
			}
			
			if (index === this._activeIndex) {
				break;
			}
		}
	},
	
	setNextUnit: function(unit) {
		var mode = this.getWalkGroup();
		var nowUnit = this.getUnit();
		
		// WalkGroup.GROUPが設定されている場合、操作していたユニットの位置に次のユニットを出す
		if( mode === WalkGroup.GROUP && unit != null ) {
			unit.setMapX(nowUnit.getMapX());
			unit.setMapY(nowUnit.getMapY());
			
			nowUnit.setInvisible(true);
			unit.setInvisible(false);
		}
		
		if( unit != null ) {
			this.setUnit(unit);
			// unitをアクティブユニットとして設定する
			root.getCurrentSession().setActiveEventUnit(unit);
			
			// 位置変え
			this._setFocus(unit);
		}
	},
	
	_setFocus: function(unit) {
		if (unit.getMapX() === this.getX() && unit.getMapY() === this.getY()) {
			return;
		}
		
		// スクロールが合う関数で位置変え
		MapView.changeMapCursorForScroll(unit.getMapX(), unit.getMapY());
	},
	
	_getWaitEvent: function(unit) {
		var event = PosChecker.getPlaceEventFromUnit(PlaceEventType.WAIT, unit);
		
		if (event !== null && event.isEvent() && event.getExecutedMark() === EventExecutedType.FREE) {
			return event;
		}
		
		return null;
	},
	
	_getDirectionInputType: function() {
		var inputType;
	
		if (!this._isInputEnabled) {
			return InputType.NONE;
		}
		
		inputType = InputControl.getInputType();
		
		return inputType;
	},
	
	_changeCursorValue: function(input) {
		var session = root.getCurrentSession();
		var xCursor0 = session.getMapCursorX();
		var yCursor0 = session.getMapCursorY();
		// カーソル位置は現在操作中のユニットの位置とする（攻撃したり会話したりするとカーソルが移動してずれる事がある）
		var nowUnit = this.getUnit();
		var xCursor = nowUnit.getMapX();
		var yCursor = nowUnit.getMapY();
		var n = root.getCurrentSession().getMapBoundaryValue();
		
		// キー入力なしならInputType.NONEを返す
		if( input === InputType.NONE ) {
			return InputType.NONE;
		}
		
		// ユニット位置とカーソル位置がずれていた場合、ユニット位置にカーソルを合わせる
		// （場所注目などでカーソル位置がずれた後、ユニット位置にカーソルを戻している）
		if( xCursor !== xCursor0 || yCursor !== yCursor0 ) {
			MapView.changeMapCursorForScroll(xCursor, yCursor);
		}
		// キー方向に合わせて向きを変える
		this._changeUnitDirection(input);
		
		if (input === InputType.LEFT) {
			xCursor--;
		}
		else if (input === InputType.UP) {
			yCursor--;
		}
		else if (input === InputType.RIGHT) {
			xCursor++;
		}
		else if (input === InputType.DOWN) {
			yCursor++;
		}
		
		// マップ端チェック（マップ端への移動有効を考慮）に引っかかった場合、マップ端なので進まない
		if (xCursor < n) {
			return InputType.NONE;
		}
		else if (yCursor < n) {
			return InputType.NONE;
		}
		else if (xCursor > CurrentMap.getWidth() - 1 - n) {
			return InputType.NONE;
		}
		else if (yCursor > CurrentMap.getHeight() - 1 - n) {
			return InputType.NONE;
		}
		
		// 指定座標にユニットが移動出来るか
		if( this._isMovable(xCursor, yCursor) !== true ) {
			return InputType.NONE;
		}
		
		this._mapLineScroll.startLineScroll(xCursor, yCursor, this._cnvInputTypeToDir(input), MoveSpeed);
//		MapView.setScroll(xCursor, yCursor);
		
		session.setMapCursorX(xCursor);
		session.setMapCursorY(yCursor);
		
		return input;
	},
	
	// 指定方向へ進行可能か
	_isMovable: function(x, y) {
		var unit;
//		var movePoint = PosChecker.getMovePointFromUnit(x, y, this.getUnit());
		var nowUnit = this.getUnit();
		var movePoint = PosChecker.getMovePointFromUnit(x, y, nowUnit);
		
		// 侵入不可地形ならfalse
		if( movePoint === 0 ) {
			return false;
		}
		
		// 指定座標にユニットがいて、表示されていればfalse
		// （ぞろぞろ移動を入れる場合、自分たちの場合はOKとか、自分のいる位置と同じ場合の処理要りそう）
		unit = PosChecker.getUnitFromPos(x, y);
//		if( unit !== null && unit.isInvisible() !== true ) {
		if( unit !== null && unit.getId() !== nowUnit.getId() ) {
			if( unit.isInvisible() !== true ) {
				return false;
			}
		}
		
		// それ以外はtrue
		return true;
	},
	
	// ユニットの向きだけ変える
	_changeUnitDirection: function(input) {
		var unit = this.getUnit();
		var oldDir = unit.getDirection();
		var dir = this._cnvInputTypeToDir(input);
		
		if( oldDir !== dir ) {
			unit.setDirection(dir);
		}
	},
	
	_cnvInputTypeToDir: function(input) {
		var dir = DirectionType.NULL;
		
		if (input === InputType.LEFT) {
			dir = DirectionType.LEFT;
		}
		else if (input === InputType.UP) {
			dir = DirectionType.TOP;
		}
		else if (input === InputType.RIGHT) {
			dir = DirectionType.RIGHT;
		}
		else if (input === InputType.DOWN) {
			dir = DirectionType.BOTTOM;
		}
		
		return dir;
	},
	
	_playMovingSound: function() {
//		MediaControl.soundDirect('mapcursor');
	},
	
	_playChangeSound: function() {
		var handle = root.createResourceHandle(isRTP_ChgSE, use_ChgSE_ID, 0, 0, 0);
		
		if (handle.isNullHandle()) {
			root.log('サウンドID不正:'+use_ChgSE_ID);
		}
		else {
			MediaControl.soundPlay(handle);
		}
	}
}
);




//-------------------------------------------
// MapViewクラス
//-------------------------------------------
MapView.changeMapCursorForScroll= function(x, y) {
		var session = root.getCurrentSession();
		var xx = x * MapChipSize + (MapChipSize/2);
		var yy = y * MapChipSize + (MapChipSize/2);
		
		session.setMapCursorX(x);
		session.setMapCursorY(y);
		
		this.setScrollPixel(xx, yy)
		MouseControl.changeCursorFromMap(x, y);
}


var alias_MapView_setScroll = MapView.setScroll;
MapView.setScroll= function(x, y) {
		// 歩行マップの場合、場所注目した後のスクロール座標はマスの中央にする(MapChipSize/2を加算)
		if( WalkControl.isWalkMap() == true ) {
			return this.setScrollPixel(x * GraphicsFormat.MAPCHIP_WIDTH + (MapChipSize/2), y * GraphicsFormat.MAPCHIP_HEIGHT + (MapChipSize/2));
		}
		
		return alias_MapView_setScroll.call(this, x, y);
}




//-------------------------------------------
// UnitSlideCursorクラス
//-------------------------------------------
// キー操作に対応して指定ユニットがスライドする
var UnitSlideCursor = defineObject(BaseObject,
{
	_slideObject: null,
	_targetUnit: null,
	_direction: null,
	_pixelIndex: 0,
	_max: 0,
	_slideType: null,
	
	// 初期化時にユニットをセットする？（その時にユニットの座標を初期位置にする？）
	initialize: function() {
		this._slideObject = createObject(SlideObjectNoMovingSound);
		this._pixelIndex = 3;						// 3+1ドットずつスライドする
		this._max = 8;								// スライドする回数
		
		this._targetUnit = null;
		this._direction = DirectionType.NULL;
	},
	
	setSlideData: function(unit, direction, speed) {
		this._prepareMemberData(unit, direction, speed);
		this._completeMemberData();
	},
	
	moveSlideCycle: function() {
		return this._slideObject.moveSlide();
	},
	
	drawSlideCycle: function() {
		this._slideObject.drawSlide();
	},
	
	endSlideCycle: function() {
		this._slideObject.updateUnitPos();
		this._slideObject.endSlide();
		
		this._targetUnit = null;
		this._direction = DirectionType.NULL;
	},
	
	_prepareMemberData: function(unit, direction, speed) {
		this._targetUnit = unit;
		this._direction = direction;
		
		// 方向が設定されていない場合は、方向を設定する。
		// 移動方向とユニット画像の方向を一致させない場合は、「ユニットの状態変更」で事前に変更しておく。
		if (this._targetUnit !== null && this._slideType === SlideType.START && this._targetUnit.getDirection() === DirectionType.NULL) {
			this._targetUnit.setDirection(this._direction);
		}
		
		// 通常の場合（デフォルト）
		this._pixelIndex = 3;							// 3+1ドットずつスライドする
		
		// 超速い場合
		if( speed === MoveFastest ) {
			this._pixelIndex = 15;						// 15+1ドットずつスライドする
		}
		// 速い場合
		else if( speed === MoveFast ) {
			this._pixelIndex = 7;						// 7+1ドットずつスライドする
		}
		// 遅い場合
		else if( speed === MoveSlow ) {
			this._pixelIndex = 1;						// 1+1ドットずつスライドする
		}
		
		this._max = Math.floor(MapChipSize/(this._pixelIndex+1));	// スライドする回数
		
		this._slideObject.setSlideData(this._targetUnit, this._direction, this._pixelIndex, this._max);
	},
	
	_completeMemberData: function() {
		this._slideObject.openSlide();
	}
}
);




//-------------------------------------------
// SlideObjectNoMovingSoundクラス
//-------------------------------------------
var SlideObjectNoMovingSound = defineObject(SlideObject,
{
	setSlideData: function(targetUnit, direction, pixelIndex, max) {
		this._targetUnit = targetUnit;
		this._direction = direction;
		this._interval = pixelIndex + 1;
		this._max = max;
		this._count = 0;
	},
	
	endSlide: function() {
		this._targetUnit.setSlideX(0);
		this._targetUnit.setSlideY(0);
//		this._targetUnit.setDirection(DirectionType.NULL);
	},
	
	_playMovingSound: function() {
		// 移動音ありの設定なら音を出す
		if( isMovingSound === true ) {
			Miscellaneous.playFootstep(this._targetUnit.getClass());
		}
	}
}
);




//-------------------------------------------
// MapLineScrollByUnitクラス
//-------------------------------------------
var MapLineScrollByUnit = defineObject(MapLineScroll,
{
	_speed: MoveSpeed,			// スクロールの速さ（0:超速い 1:速い 2:通常 3:遅い）

	setGoalData: function(x1, y1, x2, y2, dir) {
		var x, y;
		var dx = x2 - x1;
		var dy = y2 - y1;
		var e = 0;
		var n = 1;
		var minx = Math.floor(root.getGameAreaWidth() / 2);
		var miny = Math.floor(root.getGameAreaHeight() / 2);
		var maxx = CurrentMap.getWidth()  * MapChipSize - minx;
		var maxy = CurrentMap.getHeight() * MapChipSize - miny;
		
		if (x1 > x2) {
			dx = x1 - x2;
		}
		if (y1 > y2) {
			dy = y1 - y2;
		}
		
		x = x1;
		y = y1;
		
		this._goalArray = [];
		this._goalIndex = 0;
		
		// 上下左右じゃないので終了
		if( dir === DirectionType.NULL ) {
			this._goalArray.push(createPos(x2, y2));
			return;
		}
		
		// 左に移動する場合（スクロール不要な時は何もしない）
		if( dir === DirectionType.LEFT ) {
			if( !(x1 < x2 || (minx > x2 && minx > x1)) ) {
				for (; x > x2; x -= n) {
					this._goalArray.push(createPos(x, y));
				}
			}
		}
		
		// 右に移動する場合（スクロール不要な時は何もしない）
		if( dir === DirectionType.RIGHT  ) {
			if( !(x1 > x2 || (maxx < x2 && maxx < x1)) ) {
				for (; x < x2; x += n) {
					this._goalArray.push(createPos(x, y));
				}
			}
		}
		
		// 上に移動する場合（スクロール不要な時は何もしない）
		if( dir === DirectionType.TOP ) {
			if( !(y1 < y2 || (miny > y2 && miny > y1)) ) {
				for (; y > y2; y -= n) {
					this._goalArray.push(createPos(x, y));
				}
			}
		}
		
		// 下に移動する場合（スクロール不要な時は何もしない）
		if( dir === DirectionType.BOTTOM ) {
			if( !(y1 > y2 || (maxy < y2 && maxy < y1)) ) {
				for (; y < y2; y += n) {
					this._goalArray.push(createPos(x, y));
				}
			}
		}
		
		this._goalArray.push(createPos(x2, y2));
	},
	
	moveLineScroll: function() {
		var n = this._getLineInterval();
		
		if (this._goalArray === null) {
			return MoveResult.END;
		}
		
		for (; this._goalIndex < this._goalArray.length; ) {
			if (this._setLinePos(this._goalArray[this._goalIndex])) {
				this._goalIndex += n;
				break;
			}
			this._goalIndex += n;
		}
		
		if (this._goalIndex >= this._goalArray.length) {
			this._setLinePos(this._goalArray[this._goalArray.length - 1]);
			this._goalArray = null;
			this._goalIndex = 0;
			return MoveResult.END;
		}
		
		return MoveResult.CONTINUE;
	},
	
	startLineScroll: function(x, y, dir, speed) {
		var x1, y1, x2, y2;
		var session = root.getCurrentSession();
		
		if (session === null) {
			return;
		}
		
		x1 = session.getScrollPixelX() + Math.floor(root.getGameAreaWidth() / 2);
		y1 = session.getScrollPixelY() + Math.floor(root.getGameAreaHeight() / 2);
		x2 = (x * MapChipSize) + Math.floor(MapChipSize / 2);
		y2 = (y * MapChipSize) + Math.floor(MapChipSize / 2);
		
		this.setGoalData(x1, y1, x2, y2, dir);
		
		this._speed = speed;			// スクロールの速さ（0:超速い 1:速い 2:通常 3:遅い）
	},
	
	_getLineInterval: function() {
		// スクロールの速さ（0:超速い）は16ドット単位でスクロール
		if( this._speed === MoveFastest ) {
			return 16;
		}
		
		// スクロールの速さ（1:速い）は8ドット単位でスクロール
		if( this._speed === MoveFast ) {
			return 8;
		}
		
		// スクロールの速さ（3:遅い）は2ドット単位でスクロール
		if( this._speed === MoveSlow ) {
			return 2;
		}
		
		// スクロールの速さ（2:通常）は4ドット単位でスクロール（デフォルト）
		return 4;
	}
}
);




//-------------------------------------------
// MapEditクラス
//-------------------------------------------
MapEdit.isFindEvent= function() {
		return this._mapCursor.isFindEvent();
}


MapEdit.getWalkGroup= function() {
		return WalkGroup.ALONE;
}


MapEdit.isWalkGroup= function() {
		return false;
}


MapEdit.setWalkGroup= function(mode) {
}


MapEdit.invisibleWalkGroup= function() {
}


MapEdit.findNextUnit= function() {
}


MapEdit.setFrontUnit= function(unitid) {
}




//-------------------------------------------
// MapEditByUnitクラス
//-------------------------------------------

//var MapEditMode = {
//	CURSORMOVE: 0,
//	UNITMENU: 1
//};

//var MapEditResult = {
//	UNITSELECT: 0,
//	MAPCHIPSELECT: 1,
//	MAPCHIPCANCEL: 2,
//	NONE: 3
//};


// ユニットを移動させるMapEdit
var MapEditByUnit = defineObject(MapEdit,
{
	moveMapEdit: function() {
		var mode = this.getCycleMode();
		var result = MapEditResult.NONE;
		
		if (mode === MapEditMode.CURSORMOVE) {
			result = this._moveCursorMove();
		}
		// 場所イベントの処理で使用
		else if (mode === MapEditMode.UNITMENU) {
			result = this._moveUnitMenu();
		}
		
		if (result !== MapEditResult.NONE) {
			// 今後の呼び出し元の操作でユニットが更新されるかもしれないので、
			// 以前のユニットが維持されたままにしないようnullにする。
			this._prevUnit = null;
		}
		
		return result;
	},
	
	drawMapEdit: function() {
		var mode = this.getCycleMode();
		
		if (mode === MapEditMode.CURSORMOVE) {
			this._mapCursor.drawCursor();
			this._mapPartsCollection.drawMapPartsCollection();
		
			MouseControl.drawMapEdge();
		}
		// 場所イベントの処理で使用
		else if (mode === MapEditMode.UNITMENU) {
			this._mapCursor.drawCursor();
		
			MouseControl.drawMapEdge();
		}
	},
	
	setNextUnit: function(unit) {
		this._mapCursor.setNextUnit(unit);
	},
	
	openEvent: function() {
		var result = this._mapCursor.openEvent();
		
		if( result === true ) {
			this.changeCycleMode(MapEditMode.UNITMENU);
		}
		
		return result;
	},
	
	isMapCommandDisplayable: function() {
		return this._mapCursor.isMapCommandDisplayable();
	},
	
	moveEvent: function() {
		var result = this._mapCursor.moveEvent();
		
		if (result !== MoveResult.CONTINUE) {
			this.changeCycleMode(MapEditMode.CURSORMOVE);
		}
		
		return result;
	},
	
	isWalkGroup: function() {
		return this._mapCursor.isWalkGroup();
	},
	
	setWalkGroup: function(mode) {
		this._mapCursor.setWalkGroup(mode);
	},
	
	invisibleWalkGroup: function() {
		this._mapCursor.invisibleWalkGroup();
	},
	
	findNextUnit: function() {
		this._mapCursor.findNextUnit();
	},
	
	setFrontUnit: function(unitid) {
		this._mapCursor.setFrontUnit(unitid);
	},
	
	_prepareMemberData: function() {
		MapEdit._prepareMemberData.call(this);
		
		this._mapCursor = createObject(MapCursorByUnit);
		this._mapCursor.setUnit(PlayerList.getSortieList().getData(0));
		
		this._mapPartsCollection = createObject(MapPartsCollectionByUnit);
	},
	
	_moveCursorMove: function() {
		var unit = this._mapCursor.getUnitFromCursor();
		var result = MapEditResult.NONE;
		
		if (InputControl.isSelectAction()) {
			// ｚキーが押された場合に場所イベントがあるか調べる
			result = this._selectAction(unit);
		}
		else if (InputControl.isCancelAction()) {
			// ｘキーが押された場合にマップコマンドを表示
			result = this._cancelAction(unit);
		}
		else if ( WalkControl.isOptionOrDownWheel() ) {
			if( canTargetChange === true ) {
				// ｃキー押下、ホイールダウンが行われた場合にユニットを切り替えている
				this._changeTarget(true);
			}
		}
		else {
			this._mapCursor.moveCursor();
			this._mapPartsCollection.moveMapPartsCollection();
			
			unit = this.getEditTarget();
			
			// ユニットが変更された場合は更新
			if (unit !== this._prevUnit) {
				this._setUnit(unit);
			}
		}
		
		return result;
	},
	
	_selectAction: function(unit) {
		var result = MapEditResult.NONE;
		
		if( WalkControl.changeCursorValueFromMouse(unit) !== InputType.NONE ) {
			return result;
		}
		
		// 場所イベントがあればMapEditResult.UNITSELECTに切替（場所イベントで使用している）
		if( this._mapCursor.isFindEvent() === true ) {
			result = MapEditResult.UNITSELECT;
		}
		
		return result;
	},
	
	_cancelAction: function(unit) {
		// マップコマンドを表示
		var result = MapEditResult.MAPCHIPSELECT;	// マップコマンド的なのを出す
		
		return result;
	},
	
	// 場所イベントの処理で使用
	_moveUnitMenu: function() {
		var result = this._mapCursor.moveEvent();
		
		return MapEditResult.NONE;
	},
	
	// ユニットの切り替え
	_changeTarget: function(isNext) {
		this._mapCursor.changeTarget();
		
		var unit = this._mapCursor.getUnit();
		
		// ユニットが変更された場合は更新
		if (unit !== this._prevUnit) {
			this._setUnit(unit);
		}
	}
}
);




//-------------------------------------------
// MapPartsCollectionByUnitクラス
//-------------------------------------------
var MapPartsCollectionByUnit = defineObject(MapPartsCollection,
{
	_configureMapParts: function(groupArray) {
		if (EnvironmentControl.isMapUnitWindowDetail()) {
			groupArray.appendObject(MapParts.UnitInfoByUnit);
		}
		else {
			groupArray.appendObject(MapParts.UnitInfoSmallByUnit);
		}
	}
}
);




//-------------------------------------------
// PlayerTurnクラス
//-------------------------------------------
PlayerTurn.getWalkGroup= function() {
		return WalkGroup.ALONE;
}


PlayerTurn.isWalkGroup = function() {
		return false;
}


PlayerTurn.setWalkGroup = function(mode) {
}


PlayerTurn.invisibleWalkGroup = function() {
}


PlayerTurn.findNextUnit= function() {
}


PlayerTurn.setFrontUnit= function(unitid) {
}




//-------------------------------------------
// PlayerTurnByUnitクラス
//-------------------------------------------

//var PlayerTurnMode = {
//	AUTOCURSOR: 0,
//	AUTOEVENTCHECK: 1,
//	MAP: 2,
//	AREA: 3,
//	MAPCOMMAND: 4,
//	UNITCOMMAND: 5
//};

var PlayerTurnByUnit = defineObject(PlayerTurn,
{
	moveTurnCycle: function() {
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;
		
//		if (this._checkAutoTurnEnd()) {
//			return MoveResult.CONTINUE;
//		}
		
		if (mode === PlayerTurnMode.AUTOCURSOR) {
			result = this._moveAutoCursor();
		}
		else if (mode === PlayerTurnMode.AUTOEVENTCHECK) {
			result = this._moveAutoEventCheck();
		}
		else if (mode === PlayerTurnMode.MAP) {
			result = this._moveMap();
		}
		// 場所イベント関連で使用
		else if (mode === PlayerTurnMode.AREA) {
			result = this._moveArea();
		}
		else if (mode === PlayerTurnMode.MAPCOMMAND) {
			result = this._moveMapCommand();
		}
//		else if (mode === PlayerTurnMode.UNITCOMMAND) {
//			result = this._moveUnitCommand();
//		}
		
//		if (this._checkAutoTurnEnd()) {
//			return MoveResult.CONTINUE;
//		}
		
		return result;
	},
	
	drawTurnCycle: function() {
		var mode = this.getCycleMode();
		
		if (mode === PlayerTurnMode.AUTOCURSOR) {
			this._drawAutoCursor();
		}
		else if (mode === PlayerTurnMode.AUTOEVENTCHECK) {
			this._drawAutoEventCheck();
		}
		else if (mode === PlayerTurnMode.MAP) {
			this._drawMap();
		}
		// 場所イベント関連で使用
		else if (mode === PlayerTurnMode.AREA) {
			this._drawArea();
		}
		else if (mode === PlayerTurnMode.MAPCOMMAND) {
			this._drawMapCommand();
		}
//		else if (mode === PlayerTurnMode.UNITCOMMAND) {
//			this._drawUnitCommand();
//		}
	},
	
	isWalkGroup: function() {
		return this._mapEdit.isWalkGroup();
	},
	
	setWalkGroup: function(mode) {
		this._mapEdit.setWalkGroup(mode);
	},
	
	invisibleWalkGroup: function() {
		this._mapEdit.invisibleWalkGroup();
	},
	
	findNextUnit: function() {
		this._mapEdit.findNextUnit();
	},
	
	setFrontUnit: function(unitid) {
		this._mapEdit.setFrontUnit(unitid);
	},
	
	_prepareTurnMemberData: function() {
		PlayerTurn._prepareTurnMemberData.call(this);
		
		this._mapCommandManager = createObject(MapCommandByUnit);
		this._mapEdit = createObject(MapEditByUnit);
	},
	
	_completeTurnMemberData: function() {
		PlayerTurn._completeTurnMemberData.call(this);
		
		this._targetUnit = this._mapEdit.getEditTarget();
	},
	
	_moveAutoCursor: function() {
		var x, y, pos;
		
		if (this._mapLineScroll.moveLineScroll() !== MoveResult.CONTINUE) {
			pos = this._getDefaultCursorPos();
			if (pos !== null && EnvironmentControl.isAutoCursor()) {
				x = pos.x;
				y = pos.y;
			}
			else {
				x = this._xAutoCursorSave;
				y = this._yAutoCursorSave;
			}
			MapView.changeMapCursor(x, y);
			if( isAutoEventSilen === true ) {
				this.changeCycleMode(PlayerTurnMode.MAP);
			}
			else {
				this._changeEventMode();
			}
		}
		
		return MoveResult.CONTINUE;
	},
	
	_moveMap: function() {
		var result = this._mapEdit.moveMapEdit();
		
		if (result === MapEditResult.UNITSELECT) {
			if( this._mapEdit.openEvent() === true ) {
				this.changeCycleMode(PlayerTurnMode.AREA);
			}
		}
		else if (result === MapEditResult.MAPCHIPSELECT) {
			if( this._mapEdit.isMapCommandDisplayable() === true ) {
				this._targetUnit = this._mapEdit.getEditTarget();
				this._mapCommandManager.setListCommandUnit(this._targetUnit);	// 追加
				
				this._mapCommandManager.openListCommandManager();
				this.changeCycleMode(PlayerTurnMode.MAPCOMMAND);
			}
		}
		
		return MoveResult.CONTINUE;
	},
	
	// 場所イベント関連で使用
	_moveArea: function() {
		var result = this._mapEdit.moveEvent();
		
		if( result !== MoveResult.CONTINUE ) {
			this._changeEventMode();
		}
		
		return result;
	},
	
	_moveMapCommand: function() {
		var unit;
		
		if (this._mapCommandManager.moveListCommandManager() !== MoveResult.CONTINUE) {
			unit = this._mapCommandManager.getListCommandUnit();
			// ターン終了を選択した場合は実行されない
			if( isAutoEventSilen === true ) {
				this.changeCycleMode(PlayerTurnMode.MAP);
			}
			else {
				this._changeEventMode();
			}
		}
		
		return MoveResult.CONTINUE;
	},
	
	_drawAutoCursor: function() {
		MapLayer.drawUnitLayerByUnit();
	},
	
	_drawAutoEventCheck: function() {
		MapLayer.drawUnitLayerByUnit();
	},
	
	_drawMap: function() {
		MapLayer.drawUnitLayerByUnit();
		if (!root.isEventSceneActived()) {
			this._mapEdit.drawMapEdit();
		}
	},
	
	// 場所イベント関連で使用
	_drawArea: function() {
		MapLayer.drawUnitLayerByUnit();
		if (!root.isEventSceneActived()) {
			this._mapEdit.drawMapEdit();
		}
	},
	
	_drawMapCommand: function() {
		MapLayer.drawUnitLayerByUnit();
		this._mapCommandManager.drawListCommandManager();
	},
	
	_getDefaultCursorPos: function() {
		var i, unit;
		var targetUnit = null;
		var list = PlayerList.getSortieList();
		var count = list.getCount();
		
		targetUnit = list.getData(0);
		
		if (targetUnit !== null) {
			return createPos(targetUnit.getMapX(), targetUnit.getMapY());
		}
		
		return null;
	}
}
);




//-------------------------------------------
// MapCommandByUnitクラス
//-------------------------------------------
var MapCommandByUnit = defineObject(MapCommand,
{
	configureCommands: function(groupArray) {
		var index;
		
		MapCommand.configureCommands.call(this, groupArray);
		
		// isUseTurnEndがtrueでなければターン終了を削除
		if( isUseTurnEnd !== true ) {
			var i, commandLayout;
			
			i = groupArray.length-1;
			for( ;i >= 0;i-- ) {
				commandLayout = groupArray[i].getCommandLayout();
				if( commandLayout == null ) {
					continue;
				}
				
				if( commandLayout.getCommandActionType() === CommandActionType.TURNEND ) {
					groupArray.splice(i, 1);
				}
			}
		}
		
		// ストックコマンドの位置が0なら一番下（マイナスなら登録しない）
		if( MapStockCommandIndex === 0 ) {
			groupArray.appendObject(MapCommand.Stock);
		}
		// ストックコマンドの位置が0より大きければ上からMapStockCommandIndex番目にセット
		else if( MapStockCommandIndex > 0 ) {
			index = MapStockCommandIndex-1;
			
			if( index > groupArray.length-1 ) {
				index = groupArray.length-1;
			}
			
			// ストックコマンドを上からMapStockCommandIndex番目にセット
			groupArray.insertObject(MapCommand.Stock, index);
		}
		
		// ストックコマンドの位置が0なら一番下（マイナスなら登録しない）
		if( MapUnitMarshalIndex === 0 ) {
			groupArray.appendObject(MapCommandUnitMarshal);
		}
		// ストックコマンドの位置が0より大きければ上からMapStockCommandIndex番目にセット
		else if( MapUnitMarshalIndex > 0 ) {
			index = MapUnitMarshalIndex-1;
			
			if( index > groupArray.length-1 ) {
				index = groupArray.length-1;
			}
			
			// ストックコマンドを上からMapStockCommandIndex番目にセット
			groupArray.insertObject(MapCommandUnitMarshal, index);
		}
	}
}
);




//-------------------------------------------
// MapCommand.Stockクラス
//-------------------------------------------

// 歩行モードのマップコマンドで表示するストック
MapCommand.Stock = defineObject(UnitCommand.Stock,
{
	openCommand: function() {
		var screenParam = this._createScreenParam();
		
		this._stockItemTradeScreen = createObject(DataConfig.isStockTradeWeaponTypeAllowed() ? CategoryStockItemTradeScreenByUnit : StockItemTradeScreenByUnit);
		SceneManager.addScreen(this._stockItemTradeScreen, screenParam);
	},
	
	moveCommand: function() {
		
		if (SceneManager.isScreenClosed(this._stockItemTradeScreen)) {
			this._stockItemTradeScreen.getScreenResult();
			return MoveResult.END;
		}
		
		return MoveResult.CONTINUE;
	},
	
	isCommandDisplayable: function() {
		// ストック非表示ならfalse
		if (!root.getCurrentSession().isMapState(MapStateType.STOCKSHOW)) {
			return false;
		}
		
		// ユニット無しならfalse
		if( this.getCommandTarget() == null ) {
			return false;
		}
		
		// ストックコマンド表示可ならtrue
		return true;
	},
	
	_createScreenParam: function() {
		var screenParam = ScreenBuilder.buildStockItemTrade();
		
		screenParam.unit = this.getCommandTarget();
		screenParam.unitList = PlayerList.getSortieList();
		
		return screenParam;
	}
}
);




//-------------------------------------------
// MapCommand.UnitMarshalクラス
//-------------------------------------------

// マップコマンドで表示するユニット整理
MapCommandUnitMarshal = defineObject(BaseListCommand,
{
	_screen: null,
	
	openCommand: function() {
		var screenParam = this._createScreenParam();
		
		this._screen = createObject(MarshalScreen);
		SceneManager.addScreen(this._screen, screenParam);
	},
	
	moveCommand: function() {
		if (SceneManager.isScreenClosed(this._screen)) {
			return MoveResult.END;
		}
		
		return MoveResult.CONTINUE;
	},
	
	getCommandName: function() {
		return root.queryScreen('UnitMarshal').getScreenTitleName();
	},
	
	_createScreenParam: function() {
		return {};
	}
}
);




//-------------------------------------------
// StockItemTradeScreenByUnitクラス
//-------------------------------------------
var StockItemTradeScreenByUnit = defineObject(StockItemTradeScreen,
{
	_prepareScreenMemberData: function(screenParam) {
		StockItemTradeScreen._prepareScreenMemberData.call(this, screenParam);
		
		this._dataChanger = createObject(VerticalDataChangerByUnit);
	},
	
	_drawMainWindow: function() {
		var xInfo, yInfo;
		var unitWindowWidth = this._unitItemWindow.getWindowWidth();
		var stockWindowHeight = this._stockItemWindow.getWindowHeight();
		var width = this._unitItemWindow.getWindowWidth() + this._stockItemWindow.getWindowWidth();
		var x = LayoutControl.getCenterX(-1, width);
		var y = LayoutControl.getCenterY(-1, stockWindowHeight);
		
		this._itemOperationWindow.drawWindow(x, y);
		this._unitItemWindow.drawWindow(x, y + this._itemOperationWindow.getWindowHeight());
		
		if (this._isRightSideInfoWindow()) {
			this._stockItemWindow.drawWindow(x + unitWindowWidth, y);
			
			xInfo = x + this._stockItemWindow.getWindowWidth();
			yInfo = (y + stockWindowHeight) - this._itemInfoWindow.getWindowHeight();
			this._itemInfoWindow.drawWindow(xInfo, yInfo);
		}
		else {
			xInfo = (x + unitWindowWidth) - this._itemInfoWindow.getWindowWidth();
			yInfo = (y + stockWindowHeight) - this._itemInfoWindow.getWindowHeight();
			this._itemInfoWindow.drawWindow(xInfo, yInfo);
			
			// カーソルが被らないように、_unitItemWindowや_itemInfoWindowより後に描画
			this._stockItemWindow.drawWindow(x + unitWindowWidth, y);
		}
		
		xInfo = (x + unitWindowWidth + this._stockItemWindow.getWindowWidth()) - this._stockCountWindow.getWindowWidth();
		yInfo = (y - this._stockCountWindow.getWindowHeight());
		this._stockCountWindow.drawWindow(xInfo, yInfo);
		
		if ( this._unitSimpleWindow !== null ) {
			xInfo = (x + unitWindowWidth) - this._unitSimpleWindow.getWindowWidth();
			yInfo = (y + stockWindowHeight) - this._unitSimpleWindow.getWindowHeight();
			this._unitSimpleWindow.drawWindow(xInfo, yInfo);
		}
	}
}
);




//-------------------------------------------
// CategoryStockItemTradeScreenByUnitクラス
//-------------------------------------------
var CategoryStockItemTradeScreenByUnit = defineObject(CategoryStockItemTradeScreen,
{
	_prepareScreenMemberData: function(screenParam) {
		CategoryStockItemTradeScreen._prepareScreenMemberData.call(this, screenParam);
		
		this._dataChanger = createObject(VerticalDataChangerByUnit);
	},
	
	_drawMainWindow: function() {
		var stockWindowHeight = this._stockItemWindow.getWindowHeight();
		var width = this._unitItemWindow.getWindowWidth() + this._stockItemWindow.getWindowWidth();
		var x = LayoutControl.getCenterX(-1, width);
		var y = LayoutControl.getCenterY(-1, stockWindowHeight);
		
		StockItemTradeScreenByUnit._drawMainWindow.call(this)
		
		this._stockCategory.xRendering = x + width;
		this._stockCategory.yRendering = y;
		this._stockCategory.windowHeight = stockWindowHeight;
		this._stockCategory.drawStockCategory();
	}
}
);




//-------------------------------------------
// VerticalDataChangerByUnitクラス
//-------------------------------------------
var VerticalDataChangerByUnit = defineObject(VerticalDataChanger,
{	
	_changePage: function(list, data, isNext) {
		var i, count;
		var index = -1;
		
		if (data === null) {
			index = list.getIndex();
			count = list.getObjectCount();
		}
		else {
			count = list.getCount();
			for (i = 0; i < count; i++) {
				if (list.getData(i) === data) {
					index = i;
					break;
				}
			}
		}
		
		if (count === 1 || index === -1) {
			return -1;
		}
		
		if (isNext) {
			if (++index > count - 1) {
				index = 0;
			}
		}
		else {
			if (--index < 0) {
				index = count - 1;
			}
		}
		
		this._playMenuPageChangeSound();
		
		return index;
	}
}
);




//-------------------------------------------
// MapLayerクラス
//-------------------------------------------
MapLayer.drawUnitLayerByUnit= function() {
		var index = this._counter.getAnimationIndex();
		var index2 = this._counter.getAnimationIndex2();
		var session = root.getCurrentSession();
		
//		this._markingPanel.drawMarkingPanel();
		
//		this._unitRangePanel.drawRangePanel();
//		this._mapChipLight.drawLight();
		
		if (session !== null) {
			session.drawUnitSet(true, true, true, index, index2);
		}
		
		this._drawColor(EffectRangeType.MAPANDCHAR);
		
		if (this._effectRangeType === EffectRangeType.MAPANDCHAR) {
			this._drawScreenColor();
		}
		
		// フォグ演出プラグインの処理
		this.checkAndExecuteFog();
		
		// フォグ演出プラグイン(改造版)の処理
		this.checkAndExecuteNewFog();
}


MapLayer.checkAndExecuteFog= function() {
		// フォグ演出プラグインがなければ処理終了
		if( this.isFog() !== true ) {
			return;
		}
		
		var scene = root.getCurrentScene();
		
		// フォグ演出プラグインがあればtrue
		if (typeof this._map.custom.fog === 'object' && typeof this._map.custom.fog.img === 'string' && 
			(scene === SceneType.BATTLESETUP || scene === SceneType.FREE || 
			 scene === SceneType.BATTLERESULT || scene === SceneType.EVENT ||
			 scene === SceneType.REST)) {

			if (this._switchId === null || this._map.getLocalSwitchTable().isSwitchOn(this._map.getLocalSwitchTable().getSwitchIndexFromId(this._switchId))) {
				this._scrollBackground.moveScrollBackgroundCubeEx(this._map);
				this._scrollBackground.drawScrollBackground();
			}
		}
}


MapLayer.isFog= function() {
		
		// フォグ演出プラグインがあればtrue
		if (typeof this._map === 'undefined' ) {
			
			return false;
		}
		
		return true;
}


MapLayer.checkAndExecuteNewFog= function() {
		// フォグ演出プラグイン(改造版)がなければ処理終了
		if( this.isNewFog() !== true ) {
			return;
		}
		
		// 以下フォグ対応処理
		if (typeof MapInfo_Data.custom.fog === 'object' && typeof MapInfo_Data.custom.fog.img === 'string' && 
			(root.getCurrentScene() === SceneType.BATTLESETUP || root.getCurrentScene() === SceneType.FREE || 
			 root.getCurrentScene() === SceneType.BATTLERESULT || root.getCurrentScene() === SceneType.EVENT ||
			 root.getCurrentScene() === SceneType.REST)) {

			if (MapInfo_switchId === null || MapInfo_Data.getLocalSwitchTable().isSwitchOn(MapInfo_Data.getLocalSwitchTable().getSwitchIndexFromId(this._switchId))) {
				MapInfo_scrollBackground.moveScrollBackgroundCubeEx(MapInfo_Data);
				MapInfo_scrollBackground.drawScrollBackground();
			}
		}
}


MapLayer.isNewFog= function() {
		// フォグ演出プラグイン(改造版)がなければfalse
		if( typeof MapInfo_Data === 'undefined' || typeof MapInfo_switchId === 'undefined' || MapInfo_scrollBackground === 'undefined' ) {
			return false;
		}
		
		return true;
}




//-------------------------------------------
// ScrollBackgroundクラス
//-------------------------------------------
var alias_ScrollBackground_drawScrollBackground= ScrollBackground.drawScrollBackground;
ScrollBackground.drawScrollBackground= function() {
		// フォグ演出プラグインがなければ従来通りの描画
		if( MapLayer.isFog() !== true && MapLayer.isNewFog() !== true ) {
			alias_ScrollBackground_drawScrollBackground.call(this);
			return;
		}
		
		// フォグ演出プラグインあり、かつ歩行マップで無い場合は従来通りの描画
		if( isScrollBGOnlyWalk === true && WalkControl.isWalkMap() !== true ) {
			alias_ScrollBackground_drawScrollBackground.call(this);
			return;
		}
		
		// フォグ演出プラグインありでも拠点の場合は従来通りの描画
		var mapInfo = root.getCurrentSession().getCurrentMapInfo();
		if( mapInfo === null ) {
			alias_ScrollBackground_drawScrollBackground.call(this);
			return;
		}
		
		// 以下は歩行マップ（あるいはisScrollBGOnlyWalkがfalseで通常マップ）の場合の処理
		if (this._pic === null) {
			return;
		}
		
		if (this._picCache === null) {
			this._createBackgroundCache();
		}
		
		// ScrollBackgroundをスクロールさせる時にスクロール位置を考慮して描画する
		var x = 0;
		var y = 0;
		
		// 実際の画面はスクロールしている可能性があるので、スクロールXY分だけ描画位置を動かしている
		// （スクロール時に描画起点位置を変えている）
		x = -root.getCurrentSession().getScrollPixelX();
		y = -root.getCurrentSession().getScrollPixelY();
		
		var xScroll = Math.floor(this._xScroll);
		var yScroll = Math.floor(this._yScroll);
		
//		this._picCache.drawStretchParts(0, 0, root.getGameAreaWidth(), root.getGameAreaHeight(),
//			this._xScroll, this._yScroll, this._pic.getWidth(), this._pic.getHeight());
		this._picCache.drawParts(x, y, xScroll, yScroll, this._pic.getWidth(), this._pic.getHeight());
}




//-------------------------------------------
// WrapPlayerTurnクラス
//-------------------------------------------
var WrapPlayerTurn = defineObject(BaseTurn,
{
	_playerTurn: null,
	_playerTurnByUnit: null,
	_nowPlayerTurn: null,		// 現在選択されているPlayerTurn
	_otherPlayerTurn: null,		// 非選択のPlayerTurn
	_isWalkMap: false,			// 歩行マップかどうか
	
	initialize: function() {
		this._playerTurn = createObject(PlayerTurn);
		this._playerTurnByUnit = createObject(PlayerTurnByUnit);
		
		this._nowPlayerTurn = null;
		this._otherPlayerTurn = null;

		this._isWalkMap = false;
	},
	
	// どちらのPlayerTurnを使うのかチェックして切り替える（自動）
	setupUsePlayerTurn: function() {
		if(WalkControl.isWalkMap() == true ) {
			this.changePlayerTurn(true);
		}
		else {
			this.changePlayerTurn(false);
		}
	},
	
	// どちらのPlayerTurnを使うのか切り替える（手動）
	changePlayerTurn: function(isWalkMap) {
		if( isWalkMap == true ) {
			this._nowPlayerTurn = this._playerTurnByUnit;
			this._otherPlayerTurn = this._playerTurn;
			this._isWalkMap = true;
		}
		else {
			this._nowPlayerTurn = this._playerTurn;
			this._otherPlayerTurn = this._playerTurnByUnit;
			this._isWalkMap = false;
		}
	},
	
	changePlayerTurnEx: function(isWalkMap) {
		if( this._nowPlayerTurn == null || this._otherPlayerTurn == null ) {
			root.log('PlayerTurn未初期化のため中断します');
			return;
		}
		
		this.changePlayerTurn(isWalkMap);
	},
	
	// ターンが切り替わる場合に呼ばれる
	openTurnCycle: function() {
		this._nowPlayerTurn.openTurnCycle();
		
		// 歩行マップ時の処理
		if( WalkControl.isWalkMap() == true ) {
			// 歩行モードをセット
			this._nowPlayerTurn.setWalkGroup(WalkControl.getWalkGroup());
			
			// 歩行グループ：グループの場合は開始時に出撃ユニットを非表示にする
			if( this._nowPlayerTurn.isWalkGroup() == true ) {
				this._nowPlayerTurn.invisibleWalkGroup();
			}
		}
	},
	
	moveTurnCycle: function() {
		return this._nowPlayerTurn.moveTurnCycle();
	},
	
	drawTurnCycle: function() {
		this._nowPlayerTurn.drawTurnCycle();
	},
	
	isPlayerActioned: function() {
		return this._nowPlayerTurn.isPlayerActioned();
	},
	
	recordPlayerAction: function(isPlayerActioned) {
		this._nowPlayerTurn.recordPlayerAction(isPlayerActioned);
	},
	
	notifyAutoEventCheck: function() {
		this._nowPlayerTurn.notifyAutoEventCheck();
	},
	
	isDebugMouseActionAllowed: function() {
		return this._nowPlayerTurn.isDebugMouseActionAllowed();
	},
	
	setCursorSave: function(unit) {
		this._nowPlayerTurn.setCursorSave();
	},
	
	setPosValue: function(unit) {
		this._nowPlayerTurn.setPosValue();
	},
	
	setAutoCursorSave: function(isDefault) {
		this._nowPlayerTurn.setAutoCursorSave();
	},

	getTurnTargetUnit: function() {
		return this._nowPlayerTurn.getTurnTargetUnit();
	},
	
	isRepeatMoveMode: function() {
		return this._nowPlayerTurn.isRepeatMoveMode();
	},
	
	clearPanelRange: function() {
		this._nowPlayerTurn.clearPanelRange();
	},
	
	getMapEdit: function() {
		return this._nowPlayerTurn.getMapEdit();
	},
	
	findNextUnit: function() {
		this._nowPlayerTurn.findNextUnit();
	},
	
	setFrontUnit: function(unitid) {
		this._nowPlayerTurn.setFrontUnit(unitid);
	},
	
	_prepareTurnMemberData: function() {
		this._nowPlayerTurn._prepareTurnMemberData();
		this._otherPlayerTurn._prepareTurnMemberData();
	},
	
	_completeTurnMemberData: function() {
		this._nowPlayerTurn._completeTurnMemberData();
		this._otherPlayerTurn._completeTurnMemberData();
	},
	
	_moveAutoCursor: function() {
		return this._nowPlayerTurn._moveAutoCursor();
	},
	
	_moveAutoEventCheck: function() {
		return this._nowPlayerTurn._moveAutoEventCheck();
	},
	
	_moveMap: function() {
		return this._nowPlayerTurn._moveMap();
	},
	
	// 場所イベント関連で使用
	_moveArea: function() {
		return this._nowPlayerTurn._moveArea();
	},
	
	_moveMapCommand: function() {
		return this._nowPlayerTurn._moveMapCommand();
	},
	
	_moveUnitCommand: function() {
		return this._nowPlayerTurn._moveUnitCommand();
	},
	
	_drawAutoCursor: function() {
		this._nowPlayerTurn._drawAutoCursor();
	},
	
	_drawAutoEventCheck: function() {
		this._nowPlayerTurn._drawAutoEventCheck();
	},
	
	_drawMap: function() {
		this._nowPlayerTurn._drawMap();
	},
	
	// 場所イベント関連で使用
	_drawArea: function() {
		this._nowPlayerTurn._drawArea();
	},
	
	_drawMapCommand: function() {
		this._nowPlayerTurn._drawMapCommand();
	},
	
	_drawUnitCommand: function() {
		this._nowPlayerTurn._drawUnitCommand();
	},
	
	_checkAutoTurnEnd: function() {
		return this._nowPlayerTurn._checkAutoTurnEnd();
	},
	
	_setDefaultActiveUnit: function() {
		this._nowPlayerTurn._setDefaultActiveUnit();
	},
	
	_getDefaultCursorPos: function() {
		return this._nowPlayerTurn._getDefaultCursorPos();
	},
	
	_changeAutoCursor: function() {
		this._nowPlayerTurn._changeAutoCursor();
	},
	
	_changeEventMode: function() {
		this._nowPlayerTurn._changeEventMode();
	},
	
	_doEventEndAction: function() {
		this._nowPlayerTurn._doEventEndAction();
	}
}
);




})();

//-------------------------------------------------------
// 以下、プログラム（外部）
//-------------------------------------------------------

//-------------------------------------------
// MapParts.UnitInfoByUnitクラス
//-------------------------------------------
MapParts.UnitInfoByUnit = defineObject(MapParts.UnitInfo,
{
	_drawMain: function(x, y) {
		var unit = this.getMapPartsTarget();
		var width = this._getWindowWidth();
		var height = this._getWindowHeight();
		var textui = this._getWindowTextUI();
		var pic = textui.getUIImage();
		
		// 顔表示なしなら表示しない
		if (isWalkMapWindowDisp !== true) {
			return;
		}
		
		// ユニット無しorマウスの左クリックが押下されて入れば表示しない
		if (unit === null || WalkControl.isMouseLeftState() === true) {
			return;
		}
		
		WindowRenderer.drawStretchWindow(x, y, width, height, pic);
		
		x += this._getWindowXPadding();
		y += this._getWindowYPadding();
		this._drawContent(x, y, unit, textui);
	}
}
);




//-------------------------------------------
// MapParts.UnitInfoSmallByUnitクラス
//-------------------------------------------
MapParts.UnitInfoSmallByUnit = defineObject(MapParts.UnitInfoSmall,
{
	_drawMain: function(x, y) {
		MapParts.UnitInfoByUnit._drawMain.call(this, x, y);
	}
}
);




//-------------------------------------------
// WalkControlクラス
//-------------------------------------------
var WalkControl = {
	_mapId: 1000,
	_isWalkMap: false,
	_walkGroup: 0,
	
	// 操作ユニットが消去された場合次のユニットへ切り替える
	findNextUnit: function() {
		var playerTurnObject;
		var type = root.getCurrentSession().getTurnType();
		
		// 自軍ターン以外なら何もしない
		if (type !== TurnType.PLAYER) {
			return;
		}
		
		// 歩行モードでなければ何もしない
		playerTurnObject = SceneManager.getActiveScene()._playerTurnObject;
		if( playerTurnObject._isWalkMap !== true ) {
			return;
		}
		
		// 歩行モードの場合、現在ユニットが消去されていた場合ユニット切替を行う
		playerTurnObject.findNextUnit();
	},
	
	// 指定ＩＤのユニットを先頭ユニットにする
	setFrontUnit: function(unitid) {
		var playerTurnObject;
		var type = root.getCurrentSession().getTurnType();
		
		// 自軍ターン以外なら何もしない
		if (type !== TurnType.PLAYER) {
			return;
		}
		
		// 歩行モードでなければ何もしない
		playerTurnObject = SceneManager.getActiveScene()._playerTurnObject;
		if( playerTurnObject._isWalkMap !== true ) {
			return;
		}
		
		// 歩行モードの場合、指定ＩＤのユニットを先頭ユニットにする
		playerTurnObject.setFrontUnit(unitid);
	},
	
	// 変数ページ:pageの、ID:idに格納されたＩＤの自軍ユニットを先頭ユニットに切り替える
	setFrontUnitByTable: function(page, id) {
		var table, index, unitid;
		
		// ページ番号が1～6でなければ何もしない
		if( tablepage < 1 || tablepage > 6 ) {
			return;
		}
		
		table  = root.getMetaSession().getVariableTable(page-1);
		index  = table.getVariableIndexFromId(id);
		unitid = table.getVariable(index);
		
		this.setFrontUnit(unitid);
	},
	
	// 歩行グループ：グループの場合に先頭のユニット以外を非表示にする
	invisibleWalkGroup: function() {
		var playerTurnObject;
		var type = root.getCurrentSession().getTurnType();
		
		// 自軍ターン以外なら何もしない
		if (type !== TurnType.PLAYER) {
			return;
		}
		
		// 歩行モードでなければ何もしない
		playerTurnObject = SceneManager.getActiveScene()._playerTurnObject;
		if( playerTurnObject._isWalkMap !== true ) {
			return;
		}
		
		// 歩行グループ：グループでなければ何もしない
		if( playerTurnObject.isWalkGroup() !== true ) {
			return;
		}
		
		// 現在の先頭ユニット以外は非表示にする
		playerTurnObject.invisibleWalkGroup();
	},
	
	// 出撃している自軍ユニットの向きを正面にする
	recoverDirection: function() {
		var unit, list, count, i;
		
		list = PlayerList.getSortieList();
		count = list.getCount();
		
		// 自軍ユニットの向きを正面にする
		for (i = 0;i < count;i++) {
			unit = list.getData(i);
			if (unit === null) {
				continue;
			}
			
			unit.setDirection(DirectionType.NULL);
		}
	},
	
	// 出撃している自軍ユニットの待機を解除にする
	recoverWait: function() {
		var unit, list, count, i;
		
		list = PlayerList.getSortieList();
		count = list.getCount();
		
		// 自軍ユニットの待機を解除
		for (i = 0;i < count;i++) {
			unit = list.getData(i);
			if (unit === null) {
				continue;
			}
			
			unit.setWait(false);
		}
	},
	
	// 出撃状態以外全部解除
	recoverSortieUnit: function() {
		var i, unit;
		var list = PlayerList.getSortieList();
		var count = list.getCount();
		
		for (i = 0; i < count; i++) {
			unit = list.getData(i);
			UnitProvider._resetHp(unit);
			UnitProvider._resetInjury(unit);
			UnitProvider._resetState(unit);
			UnitProvider._resetUnitState(unit);
			UnitProvider._resetUnitStyle(unit);
		}
	},
	
	// 以下は出撃状態以外全部解除の中の一部だけを実施する為の関数
	
	// HPと負傷を回復
	recoverSortieUnitHp: function() {
		var i, unit;
		var list = PlayerList.getSortieList();
		var count = list.getCount();
		
		for (i = 0; i < count; i++) {
			unit = list.getData(i);
			UnitProvider._resetHp(unit);
			UnitProvider._resetInjury(unit);
		}
	},
	
	// 負傷を回復（負傷ユニットはHP1になる）
	recoverSortieUnitInjury: function() {
		var i, unit;
		var list = PlayerList.getSortieList();
		var count = list.getCount();
		
		for (i = 0; i < count; i++) {
			unit = list.getData(i);
			if (unit.getAliveState() === AliveType.INJURY) {
				// 負傷状態ならHPを1にする
				unit.setHp(1);
			}
			UnitProvider._resetInjury(unit);
		}
	},
	
	// ステートを全解除
	recoverSortieUnitState: function() {
		var i, unit;
		var list = PlayerList.getSortieList();
		var count = list.getCount();
		
		for (i = 0; i < count; i++) {
			unit = list.getData(i);
			UnitProvider._resetState(unit);
		}
	},
	
	// 待機、不死身状態、非表示状態、バッドステートガードを全解除
	recoverSortieUnitState: function() {
		var i, unit;
		var list = PlayerList.getSortieList();
		var count = list.getCount();
		
		for (i = 0; i < count; i++) {
			unit = list.getData(i);
			UnitProvider._resetUnitState(unit);
		}
	},
	
	// フュージョンと形態変化を全解除（解除するだけなので座標は変わらない）
	recoverSortieUnitFusionMetamorphoze: function() {
		var i, unit;
		var list = PlayerList.getSortieList();
		var count = list.getCount();
		
		for (i = 0; i < count; i++) {
			unit = list.getData(i);
			UnitProvider._resetUnitStyle(unit);
		}
	},
	
	//---------------------------------------------------------------
	// 以下はマウス関係の検出用の関数です
	//---------------------------------------------------------------
	
	// 現在のマウスカーソルに対応するマップのインデックスを取得
	getMapIndexFromMouse: function() {
		var index = 0;
		var session = root.getCurrentSession();
		var xCursor = Math.floor((root.getMouseX() + session.getScrollPixelX() - root.getViewportX()) / MapChipSize);
		var yCursor = Math.floor((root.getMouseY() + session.getScrollPixelY() - root.getViewportY()) / MapChipSize);
		
		if (!EnvironmentControl.isMouseOperation()) {
			return -1;
		}
		
		// 現在の画面状態がソフトウェアによるフルスクリーンの場合は、マウスを考慮しない
		if (root.getAppScreenMode() === AppScreenMode.SOFTFULLSCREEN) {
			return -1;
		}
		
		// 左クリックが押されていない場合は-1
		if( this.isMouseLeftState() !== true ) {
			return -1;
		}
		
		index = CurrentMap.getIndex(xCursor, yCursor);
		return index;
	},
	
	// 左クリックの検出
	isMouseLeftState: function() {
		return root.isMouseState(MouseType.LEFT);
	},
	
	// ｃキー押下とホイールダウンの検出
	isOptionOrDownWheel: function() {
		return (InputControl.isOptionAction() || MouseControl.isInputAction(MouseType.DOWNWHEEL));
	},
	
	// マウスで指定されたマップのインデックスを移動方向に変換
	changeCursorValueFromMouse: function(unit) {
		var unitX, unitY, x, y, xx, yy, absx, absy;
		var input = InputType.NONE;
		var mapIndex = WalkControl.getMapIndexFromMouse();
		
		if( mapIndex === -1 ) {
			return InputType.NONE;
		}
		
		if( unit == null ) {
			return InputType.NONE;
		}
		
		x = CurrentMap.getX(mapIndex);
		y = CurrentMap.getY(mapIndex);
		
		unitX = unit.getMapX();
		unitY = unit.getMapY();
		
		// マウスでクリックした地点が操作ユニットのx、y座標どちらとも合わない場合は何もしない
		if( unitX !== x && unitY !== y ) {
			return InputType.NONE;
		}
		
		// マウスでクリックした地点が操作ユニットの座標そのままなら何もしない
		if( unitX === x && unitY === y ) {
			return InputType.NONE;
		}
		
		if( unitX === x ) {
			yy = unitY - y;
			absy = Math.abs(yy);
			if( absy < 1 || absy > 24 ) {
				return InputType.NONE;
			}
			
			if( yy > 0 ) {
				input = InputType.UP;
			}
			else {
				input = InputType.DOWN;
			}
		}
		else {
			xx = unitX - x;
			absx = Math.abs(xx);
			if( absx < 1 || absx > 40 ) {
				return InputType.NONE;
			}
			
			if( xx > 0 ) {
				input = InputType.LEFT;
			}
			else {
				input = InputType.RIGHT;
			}
		}
		return input;
	},
	
	//---------------------------------------------------------------
	// 以下は状態参照用の関数です（外部プラグインから参照する用）
	//---------------------------------------------------------------
	
	// マップIDの取得
	getMapId: function() {
		return this._mapId;
	},
	
	// 歩行マップかどうか（戻り値が true:歩行マップ false:通常マップ）
	isWalkMap: function() {
		return this._isWalkMap;
	},
	
	// 歩行グループ（通常／グループ）の取得（戻り値が 0:通常 1:グループ）
	getWalkGroup: function() {
		return this._walkGroup;
	},
	
	//---------------------------------------------------------------
	// 以下は通常と歩行操作を切り替える時に使用します
	// ※場所イベントや自動開始イベントから呼び出すようにしてください
	//   （ユニットイベントから直接呼び出すと、戦闘画面表示中にマップ状態を切り替えておかしくなることがあります）
	//---------------------------------------------------------------
	// 通常と歩行操作を切り替える
	changePlayerTurnWalk: function(isWalkMap) {
		var playerTurnObject;
		var type = root.getCurrentSession().getTurnType();
		
		this.recoverDirection();
		this.recoverWait();			// 自軍の待機を解除しないと、入れたプラグイン次第でオートターンエンドが動作する事がある
		playerTurnObject = SceneManager.getActiveScene()._playerTurnObject;
		if( playerTurnObject == null ) {
			root.log('playerTurnObjectがまだ存在しません。処理を終了します');
			return;
		}
		
		playerTurnObject.changePlayerTurnEx(isWalkMap);
		this.setWalkMap(isWalkMap);
		
		SceneManager.getActiveScene().turnEndByUnit(isWalkMap);
	},
	
	//---------------------------------------------------------------
	// 以下はプラグイン管理用の関数なので弄らないようにして下さい
	//---------------------------------------------------------------
	
	// 自動イベントのチェック（歩行モードのマップ上で使えます）
	notifyAutoEventCheck: function() {
		var playerTurnObject;
		var type = root.getCurrentSession().getTurnType();
		
		// 自軍ターン以外なら何もしない
		if (type !== TurnType.PLAYER) {
			return;
		}
		
		// 歩行モードでなければ何もしない
		playerTurnObject = SceneManager.getActiveScene()._playerTurnObject;
		if( playerTurnObject._isWalkMap !== true ) {
			return;
		}
		
		SceneManager.getActiveScene().notifyAutoEventCheck();
	},
	
	// 歩行関連のデータリセット
	resetData: function() {
		this._mapId = 1000;
		this._isWalkMap = false;
		this._walkGroup = 0;
	},
	
	// マップIDのセット（設定してるけど今は使ってない）
	setMapId: function(id) {
		this._mapId = id;
	},
	
	// 歩行マップかどうかのセット
	setWalkMap: function(isWalkMap) {
		this._isWalkMap = isWalkMap;
	},
	
	// 歩行グループ（通常／グループ）のセット
	setWalkGroup: function(walkGroup) {
		this._walkGroup = walkGroup;
	},
	
	// セーブ用のカスタムデータ作成
	createDataObject: function() {
		var customData = {};
		
		customData._mapId  = this._mapId;
		customData._isWalkMap = this._isWalkMap;
		customData._walkGroup = this._walkGroup;
		
		return customData;
	},
	
	// ロードしたカスタムデータ反映
	updateDataObject: function(customData) {
		this._mapId = customData._mapId;
		this._isWalkMap = customData._isWalkMap;
		this._walkGroup = customData._walkGroup;
	}
};


