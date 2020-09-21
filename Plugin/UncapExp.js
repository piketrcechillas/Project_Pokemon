
/*--------------------------------------------------------------------------
  
　経験値100以上

■概要
　敵を倒した際の経験値入手量を100以上に出来るようになります
　初期状態では一度に最大で2000expまで入手可能です

■カスタマイズ
　・一度に入手できる経験値を最大10000expにしたい
　　　→設定にある「var Experience100OverMaxValue = 2000;」の2000を10000に書き変えて下さい


17/08/20  新規作成
17/09/18  変数定義漏れのバグを修正
18/03/10  1.177対応
18/07/13  1.189対応
18/07/23  1.190対応


■対応バージョン
　SRPG Studio Version:1.190


■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。どんどん改造してください。
・クレジット明記無し　OK
・再配布、転載　OK
・SRPG Studio利用規約は遵守してください。
  
--------------------------------------------------------------------------*/


(function() {
//-------------------------------------------------------
// 設定
//-------------------------------------------------------
var Experience100OverMaxValue = 2000;		// 一度に入る最大の経験値（2000まで入るようにしている）




//-------------------------------------------------------
// 以下、プログラム
//-------------------------------------------------------

//-----------------------------
// RestrictedExperienceControlクラス
//-----------------------------
if( typeof RestrictedExperienceControl !== 'undefined' && 
	typeof RestrictedExperienceControl.obtainExperienceFix === 'undefined' && 
	typeof RestrictedExperienceControl.obtainExperienceCorrection === 'undefined' ) {

	RestrictedExperienceControl.obtainExperience= function(unit, getExp) {
		var i, count, objectArray;
		var sum = 0;
		
		ExperienceControl._lvUpCnt = ExperienceControl._addExperience(unit, getExp);
		if ( !ExperienceControl._lvUpCnt ) {
			return null;
		}
		
		objectArray = this._createObjectArray(unit);
		count = objectArray.length;
		for (i = 0; i < count; i++) {
			if (objectArray[i].value !== 0) {
				sum++;
			}
		}
		
		objectArray = this._sortObjectArray(objectArray, sum, unit);
		
		return this._getGrowthArray(objectArray);
	}
}




//-----------------------------
// ExperienceControlクラス
//-----------------------------
// 経験値処理の修正
ExperienceControl.obtainExperience= function(unit, getExp) {
		var i;
		var growthArray = [];
		
		this._lvUpCnt = this._addExperience(unit, getExp);
		
		// レベルアップしない場合終了
		if ( !this._lvUpCnt ) {
			return null;
		}
		
		// レベルアップする場合
		
		if (unit.getUnitType() === UnitType.PLAYER) {
			// プレイヤーの場合、レベルアップ回数分能力値の成長チェックを行う（成長結果はgrowthArrayに加算していく）
			for( i = 0;i < this._lvUpCnt;i++ ) {
				growthArray = this._addGrowthArray(growthArray, this._createGrowthArray(unit) );
			}
		}
		else {
			growthArray = unit.getClass().getPrototypeInfo().getGrowthArray(unit.getLv());
		}
		
		return growthArray;
}

ExperienceCalculator._getExperienceFactor = function(unit) {
		var skill;
		var factor = 100;
		var option = root.getMetaSession().getDifficulty().getDifficultyOption();
		
		if (option & DifficultyFlag.GROWTH) {
			factor = 200;
		}
		
		skill = SkillControl.getBestPossessionSkill(unit, SkillType.GROWTH);
		if (skill !== null) {
			factor = skill.getSkillValue();
		}

		root.log("WILD?" + isWild)

		if(!isWild) {
			factor = 150;
		}
		
		return factor / 100;
	}

// レベルアップ回数の取得（他のプラグインから呼び出される事がある）
ExperienceControl.getLvUpCnt= function() {
		return this._lvUpCnt;
}


// 経験値の加算＆レベルアップ回数算出を行う
ExperienceControl._addExperience= function(unit, getExp) {
		var exp;
		var baselineExp = this._getBaselineExperience();
		var LvUpcnt = 0;
		
		// 現在のユニットの経験値と習得経験値を加算
		exp = unit.getExp() + getExp; 
		
		if (exp >= baselineExp) {
			while(exp >= baselineExp) { 
				// レベルアップ回数+1
				LvUpcnt++;

				// 基準値を超えた場合は、レベルを1つ上げる
				unit.setLv(unit.getLv() + 1);
				if (unit.getLv() >= Miscellaneous.getMaxLv(unit)) {
					// 最大レベルに到達した場合は、経験値は0
					exp = 0;
				}
				else {
					// 基準値を引くことで、expが基準値以下に収まるようにする
					exp -= baselineExp;
				}
			}
			
			unit.setExp(exp);
		}
		else {
			unit.setExp(exp);
			
			// レベルアップでない場合は、0を返す
			return 0;
		}
		
			// レベルアップした場合は、レベルアップ回数を返す
		return LvUpcnt;
}


// 能力上昇テーブルを加算する追加関数（何回もレベルアップする場合に複数回呼び出される）
ExperienceControl._addGrowthArray= function(growthArray, addGrowthArray) {
		var i;
		var count = ParamGroup.getParameterCount();

		// 一番最初は能力上昇テーブルを0クリア
		if( growthArray.length == 0 ) {
			for (i = 0; i < count; i++) {
				growthArray[i] = 0;
			}
		}

		for (i = 0; i < count; i++) {
			// 能力上昇テーブルに、上昇する値を加算していく
			growthArray[i] = growthArray[i] + addGrowthArray[i];
		}
		
		return growthArray;
}




//-----------------------------
// ExperienceNumberViewクラス
//-----------------------------
var alias1 = ExperienceNumberView.setExperienceNumberData;
ExperienceNumberView.setExperienceNumberData= function(unit, exp) {
		alias1.call(this, unit, exp);
		
		// Experience100OverMaxValueで指定した値まで経験値を表示する
		this._balancer.setBalancerInfo(0, Experience100OverMaxValue);

		this._balancer.setBalancerSpeed(20);
		this._balancer.startBalancerMove(exp);
}




//-----------------------------
// ExperienceCalculatorクラス
//-----------------------------
ExperienceCalculator.getBestExperience= function(unit, exp) {
		exp = Math.floor(exp * this._getExperienceFactor(unit));
		
		// 取得できる経験値は最大でExperience100OverMaxValueで指定した値まで（公式の場合100になっている）
		if (exp > Experience100OverMaxValue) {
			exp = Experience100OverMaxValue;
		}
		else if (exp < 0) {
			exp = 0;
		}
		
		return exp;
}


})();