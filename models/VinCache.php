<?php

namespace app\models;

use Yii;
use yii\db\ActiveRecord;

/**
 * VinCache ActiveRecord Model
 *
 * @property string $vin
 * @property string|null $make
 * @property string|null $model
 * @property string|null $year
 * @property string|null $engine_details
 * @property string|null $raw_data
 * @property string $created_at
 */
class VinCache extends ActiveRecord
{
    public static function tableName()
    {
        return 'vin_cache';
    }

    public function rules()
    {
        return [
            [['vin'], 'required'],
            [['engine_details', 'raw_data'], 'string'],
            [['created_at'], 'safe'],
            [['vin'], 'string', 'max' => 50],
            [['make', 'model'], 'string', 'max' => 100],
            [['year'], 'string', 'max' => 20],
            [['vin'], 'unique'],
        ];
    }
}
