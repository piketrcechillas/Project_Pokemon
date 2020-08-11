
/*--------------------------------------------------------------------------
  
　ユニットの向きを変えるスクリプト

■概要
本プラグインをいれてスクリプトを実行すると、
対象ユニットが、目標ユニットの方向を向くようにできます。

■使い方
イベントの実行条件でスクリプトを選択し、スクリプトの実行条件のチェックボックスをONします。
その後、下部のテキストボックスに以下を書き込んでください。

『関数一覧』
　　// param1のID:unitidのユニットを、param2のID:targetidのユニットに対してdirection方向へ向かせる
　　UnitDirectionControl.setDirection(param1, unitid, param2, targetid, direction);
        param1,2に指定するパラメータ
            UnitDirValue.PLAYER_UNIT             // プレイヤーユニット
            UnitDirValue.GUEST_UNIT              // ゲストユニット
            UnitDirValue.GUEST_EVENT_UNIT        // ゲストイベントユニット
            UnitDirValue.ENEMY_INIT_UNIT         // 初期配置の敵ユニット
            UnitDirValue.ENEMY_EVENT_UNIT        // イベント敵ユニット
            UnitDirValue.ALLY_INIT_UNIT          // 初期配置の同盟ユニット
            UnitDirValue.ALLY_EVENT_UNIT         // 同盟イベントユニット
            UnitDirValue.DIRECT_ID_ENEMY          // 敵を直接ID指定（所属変更したユニットはこれを使用）
            UnitDirValue.DIRECT_ID_ALLY           // 同盟を直接ID指定（所属変更したユニットはこれを使用）

        directionに指定するパラメータ
            DirCtrlValue.FACE                    // 目標ユニットの方を向く
            DirCtrlValue.FACE_R                  // 目標ユニットに対して右の方を向く
            DirCtrlValue.FACE_L                  // 目標ユニットに対して左の方を向く
            DirCtrlValue.FACE_REV                // 目標ユニットに対して反対の方を向く
            DirCtrlValue.NULL                    // 方向無し（目標ユニットに向くのをやめる）


　　// param1のID:unitidのユニットを、x, y で指定したマップ座標に対してdirection方向へ向かせる
　　UnitDirectionControl.setDirectionByPos(param1, unitid, x, y, direction);
        param1に指定するパラメータ
            UnitDirValue.PLAYER_UNIT             // プレイヤーユニット
            UnitDirValue.GUEST_UNIT              // ゲストユニット
            UnitDirValue.GUEST_EVENT_UNIT        // ゲストイベントユニット
            UnitDirValue.ENEMY_INIT_UNIT         // 初期配置の敵ユニット
            UnitDirValue.ENEMY_EVENT_UNIT        // イベント敵ユニット
            UnitDirValue.ALLY_INIT_UNIT          // 初期配置の同盟ユニット
            UnitDirValue.ALLY_EVENT_UNIT         // 同盟イベントユニット

        directionに指定するパラメータ
            DirCtrlValue.FACE                    // 目標ユニットの方を向く
            DirCtrlValue.FACE_R                  // 目標ユニットに対して右の方を向く
            DirCtrlValue.FACE_L                  // 目標ユニットに対して左の方を向く
            DirCtrlValue.FACE_REV                // 目標ユニットに対して反対の方を向く
            DirCtrlValue.NULL                    // 方向無し（目標ユニットに向くのをやめる）


　　// 変数ページtablepageのID:tableidにユニットIDを入れたユニットを、x, y で指定したマップ座標に対してdirection方向へ向かせる
　　UnitDirectionControl.setDirectionByPosFromVA(tablepage, tableid, x, y, direction);
        tablepageに指定するパラメータ：変数のページ
            変数ページ1の場合：0
            変数ページ2の場合：1
            変数ページ3の場合：2
            変数ページ4の場合：3
            変数ページ5の場合：4

        directionに指定するパラメータ
            DirCtrlValue.FACE                    // 目標ユニットの方を向く
            DirCtrlValue.FACE_R                  // 目標ユニットに対して右の方を向く
            DirCtrlValue.FACE_L                  // 目標ユニットに対して左の方を向く
            DirCtrlValue.FACE_REV                // 目標ユニットに対して反対の方を向く
            DirCtrlValue.NULL                    // 方向無し（目標ユニットに向くのをやめる）


16/10/23 新規作成
17/03/19 UnitDirectionControl.setDirectionByPos(),UnitDirectionControl.setDirectionByPosFromVA()を追加
19/12/20 所属変更したユニットを指定できるよう、DIRECT_ID_ENEMY、DIRECT_ID_ALLYを追加


■対応バージョン
　SRPG Studio Version:1.207


■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。どんどん改造してください。
・クレジット明記無し　OK
・再配布、転載　OK
・SRPG Studio利用規約は遵守してください。
  
--------------------------------------------------------------------------*/


//----------------------------------
// 指定用の定義値
//----------------------------------
var UnitDirValue = {
	// param1,2に指定するパラメータ
	PLAYER_UNIT         : 0x0101,	// プレイヤーユニット指定     (0x0101=10進だと257)
	GUEST_UNIT          : 0x0102,	// ゲストユニット指定         (0x0102=10進だと258)
	GUEST_EVENT_UNIT    : 0x0103,	// ゲストイベントユニット指定 (0x0103=10進だと259)
	ENEMY_INIT_UNIT     : 0x0204,	// 初期配置の敵ユニット指定   (0x0204=10進だと516)
	ENEMY_EVENT_UNIT    : 0x0205,	// イベント敵ユニット指定     (0x0205=10進だと517)
	ENEMY_REINFORCE_UNIT: 0x0206,	// 援軍敵ユニット指定         (0x0206=10進だと518) ※援軍の向きは変えられないので実際には無意味
	ALLY_INIT_UNIT      : 0x0304,	// 初期配置の同盟ユニット指定 (0x0304=10進だと772)
	ALLY_EVENT_UNIT     : 0x0305,	// 同盟イベントユニット       (0x0305=10進だと773)
	DIRECT_ID_ENEMY     : 0x0306,	// 敵を直接ID指定（所属変更したユニットはこれを使用）
	DIRECT_ID_ALLY      : 0x0307	// 同盟を直接ID指定（所属変更したユニットはこれを使用）
};


//----------------------------------
// 備考：ユニットの所属・種類別のID補正値
//----------------------------------
// 自軍              :IDそのまま
// 敵ユニット        :ID+65536  (65536*1)
// イベント敵ユニット:ID+131072 (65536*2)
// 同盟              :ID+196608 (65536*3)
// 同盟イベント      :ID+262144 (65536*4)
// 援軍敵ユニット    :ID+327680 (65536*5)
// ゲスト            :ID+393216 (65536*6)
// ゲストイベント    :ID+458752 (65536*7)


var DirCtrlValue = {
	// directionに指定するパラメータ
	FACE    : 0,					// 目標ユニットの方を向く
	FACE_R  : 1,					// 目標ユニットに対して右の方を向く
	FACE_L  : -1,					// 目標ユニットに対して左の方を向く
	FACE_REV: 2,					// 目標ユニットに対して反対の方を向く
	NULL: 999						// 方向無し（目標ユニットに向くのをやめる）
};




//----------------------------------
// UnitDirectionControlクラス
//----------------------------------
var UnitDirectionControl = {
	// 対象ユニット基準で指定の方向を向く
	setDirection: function(param1, unitid, param2, targetid, direction) {
		var unit       = this._getUnit(param1, unitid);
		var targetunit = this._getUnit(param2, targetid);

		if( unit == null ){
			root.log('ユニット取得失敗 param1:0x'+param1.toString(16)+' ID:'+unitid);
			return;
		}

		if( targetunit == null ){
			root.log('ユニット取得失敗 param2:0x'+param2.toString(16)+' ID:'+targetid);
			return;
		}

		this._setUnitDirecion(unit, targetunit, direction);
	},
	
	// 対象座標基準で指定の方向を向く
	setDirectionByPos: function(param1, unitid, x, y, direction) {
		var unit       = this._getUnit(param1, unitid);

		if( unit == null ){
			root.log('ユニット取得失敗 param1:0x'+param1.toString(16)+' ID:'+unitid);
			return;
		}

		this._setUnitDirecionByPos(unit, x, y, direction);
	},
	
	// 対象座標基準で指定の方向を向く
	setDirectionByPosFromVA: function(tablepage, tableid, x, y, direction) {
		var unitid = this._getVATable(tablepage, tableid);
		var unit       = this._getUnitFromId(unitid);

		if( unit == null ){
			root.log('ユニット取得失敗 ID:'+unitid);
			return;
		}

		this._setUnitDirecionByPos(unit, x, y, direction);
	},
	
	// 指定変数の取得
	_getVATable: function(tablepage, tableid) {
		var table = root.getMetaSession().getVariableTable(tablepage);
		var index = table.getVariableIndexFromId(tableid);
		return table.getVariable(index);
	},
	
	//-----------------------
	// 以下、下位関数
	//-----------------------
	
	// 指定のユニットを取得する
	_getUnit: function(param, unitid) {
		switch(param) {
			case UnitDirValue.PLAYER_UNIT:
				return this._getPlayerUnit(unitid);
				break;
			case UnitDirValue.GUEST_UNIT:
				return this._getGuestUnit(unitid);
				break;
			case UnitDirValue.GUEST_EVENT_UNIT:
				return this._getGuestEventUnit(unitid);
				break;
			case UnitDirValue.ENEMY_INIT_UNIT:
				return this._getInitEnemyUnit(unitid);
				break;
			case UnitDirValue.ENEMY_EVENT_UNIT:
				return this._getEnEnemyUnit(unitid);
				break;
			case UnitDirValue.ENEMY_REINFORCE_UNIT:
				return this._getReEnemyUnit(unitid);
				break;
			case UnitDirValue.ALLY_INIT_UNIT:
				return this._getInitAllyUnit(unitid);
				break;
			case UnitDirValue.ALLY_EVENT_UNIT:
				return this._getPaAllyUnit(unitid);
				break;
			case UnitDirValue.DIRECT_ID_ENEMY:
				return this._getEnemyUnitFromID(unitid);
				break;
			case UnitDirValue.DIRECT_ID_ALLY:
				return this._getAllyUnitFromID(unitid);
				break;
		}

		root.log('パラメータparam不正:0x'+param.toString(16));
		return null;
	},
	
	// 指定idのユニットを取得する
	_getUnitFromId: function(unitid) {
		var unit;

		// 自軍、ゲスト、ゲストイベント
		if( unitid < 65536 || unitid >= 393216 ) {
			return this._getPlayerUnitFromID(unitid);
		}
		// 敵、敵イベント、援軍
		if( (unitid >= 65536 && unitid < 196608) || (unitid >= 327680 && unitid < 393216) ) {
			unit = this._getEnemyUnitFromID(unitid);
			if( unit !== null ) {
				return unit;
			}
			// 敵軍にいない場合は同盟軍をチェック
			return this._getAllyUnitFromID(unitid);
		}
		// 同盟、同盟イベント
		if( (unitid >= 196608 && unitid < 327680) ) {
			unit = this._getAllyUnitFromID(unitid);
			if( unit !== null ) {
				return unit;
			}
			// 同盟軍にいない場合は敵軍をチェック
			return this._getEnemyUnitFromID(unitid);
		}
		// それ以外はnull
		return null;
	},
	
	// 対象ユニットを基準にユニットの向きを変える
	_setUnitDirecion: function(unit, targetunit, direction) {
		var dir = this._setDirecionXY(unit.getMapX(), unit.getMapY(), targetunit.getMapX(), targetunit.getMapY(), direction);
		// ユニットの向きをセット
		unit.setDirection(dir);
	},
	
	// 指定座標を基準にユニットの向きを変える
	_setUnitDirecionByPos: function(unit, target_x, target_y, direction) {
		var dir = this._setDirecionXY(unit.getMapX(), unit.getMapY(), target_x, target_y, direction);
		// ユニットの向きをセット
		unit.setDirection(dir);
	},
	
	// ユニットの向きを変える（）
	_setDirecionXY: function(unit_x, unit_y, target_x, target_y, direction) {
		var dir      = DirectionType.NULL;

		// 向きを変えたいユニットと目標ユニットのXの差、Yの差を求める
		var x = unit_x - target_x;
		var y = unit_y - target_y;
		// Xの差、Yの差を絶対値にする
		var absx = Math.abs(x);
		var absy = Math.abs(y);

		// 絶対値Xの差<=絶対値Yの差の場合、上もしくは下を向く
		if( absx <= absy ) {
			if( y < 0 ) {
				// 向きを変えたいユニットの方が上にいるので、向く方向は下を基準として算出
				dir = this._cnvDir( direction, DirectionType.BOTTOM );
			}
			else {
				// 向きを変えたいユニットの方が下にいるので、向く方向は上を基準として算出
				dir = this._cnvDir( direction, DirectionType.TOP );
			}
		}
		// それ以外は、右もしくは左を向く
		else {
			if( x < 0 ) {
				// 向きを変えたいユニットの方が左にいるので、向く方向は右を基準として算出
				dir = this._cnvDir( direction, DirectionType.RIGHT );
			}
			else {
				// 向きを変えたいユニットの方が右にいるので、向く方向は左を基準として算出
				dir = this._cnvDir( direction, DirectionType.LEFT );
			}
		}
		// ユニットの向きを返す
		return dir;
	},
	
	// directionの値に応じて向きを変換する
	_cnvDir: function(direction, now_dir) {
		// 方向無しの場合は方向無しを返す
		if( direction == DirCtrlValue.NULL ) {
			return DirectionType.NULL;
		}
		
		return ((direction + now_dir) & 0x03);

//		// directionに入っている値
//		var DirCtrlValue = {
//			FACE    : 0,					// 目標ユニットの方を向く
//			FACE_R  : 1,					// 目標ユニットに対して右の方を向く
//			FACE_L  : -1,					// 目標ユニットに対して左の方を向く
//			FACE_REV: 2						// 目標ユニットに対して反対の方を向く
//			NULL: 999						// 方向無し（目標ユニットに向くのをやめる）
//		};

//		// now_dirに入っている値
//		var DirectionType = {
//			LEFT: 0,						// 左
//			TOP: 1,							// 上
//			RIGHT: 2,						// 右
//			BOTTOM: 3,						// 下
//			NULL: 4,
//			COUNT: 4
//		};

//		なので、(direction+now_dir)の結果に0x03で論理積を行うと、欲しい方向に変わる

	},
	
	//-----------------------
	// 自軍関連
	//-----------------------
	// 指定IDのプレイヤーユニットを取得
	_getPlayerUnit: function(unitid) {
		return this._getPlayerUnitFromID(unitid);
	},
	
	// 指定IDのゲストユニットを取得
	_getGuestUnit: function(unitid) {
		return this._getPlayerUnitFromID(unitid+393216);	// ゲストユニットのID 0は393216となっている
	},
	
	// 指定IDのゲストイベントユニットを取得
	_getGuestEventUnit: function(unitid) {
		return this._getPlayerUnitFromID(unitid+458752);	// ゲストイベントユニットのID 0は458752となっている
	},
	
	//-----------------------
	// 敵関連
	//-----------------------
	// 指定IDの敵ユニットを取得（初期配置の敵のみ）
	_getInitEnemyUnit: function(unitid) {
		return this._getEnemyUnitFromID(unitid+65536);		// 敵ユニットのID 0は65536となっている
	},
	
	// 指定IDのイベント敵ユニットを取得
	_getEnEnemyUnit: function(unitid) {
		return this._getEnemyUnitFromID(unitid+131072);	// イベント敵ユニットのID 0は131072となっている
	},
	
	// 指定IDの援軍の敵ユニットを取得
	_getReEnemyUnit: function(unitid) {
		return this._getEnemyUnitFromID(unitid+327680);	// 援軍敵ユニットのID 0は327680となっている
	},
	
	//-----------------------
	// 同盟関連
	//-----------------------
	// 指定IDの同盟ユニットを取得（初期配置の同盟のみ）
	_getInitAllyUnit: function(unitid) {
		return this._getAllyUnitFromID(unitid+196608);	// 初期配置の同盟ユニットのID 0は196608となっている
	},
	
	// 指定IDの同盟イベントを取得
	_getPaAllyUnit: function(unitid) {
		return this._getAllyUnitFromID(unitid+262144);	// 同盟イベントユニットのID 0は262144となっている
	},
	
	//-----------------------
	// 最下位関数
	//-----------------------
	// 指定ユニットIDの自軍ユニットを取得
	_getPlayerUnitFromID: function(unitid) {
		var unitlist = root.getCurrentSession().getPlayerList();
		var unit = unitlist.getDataFromId(unitid); 
		return unit;
	},
	
	// 指定ユニットIDの敵軍ユニットを取得
	_getEnemyUnitFromID: function(unitid) {
		var unitlist = root.getCurrentSession().getEnemyList();
		var unit = unitlist.getDataFromId(unitid); 
		return unit;
	},
	
	// 指定ユニットIDの同盟ユニットを取得
	_getAllyUnitFromID: function(unitid) {
		var unitlist = root.getCurrentSession().getAllyList();
		var unit = unitlist.getDataFromId(unitid); 
		return unit;
	}
};



