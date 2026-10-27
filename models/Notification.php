<?php

namespace app\models;

use Yii;
use yii\db\ActiveRecord;

/**
 * Notification ActiveRecord Model
 *
 * @property string $id
 * @property string $recipient
 * @property string $title
 * @property string $message
 * @property string|null $link
 * @property int $is_read
 * @property string $created_at
 */
class Notification extends ActiveRecord
{
    public static function tableName()
    {
        return 'notifications';
    }

    public function rules()
    {
        return [
            [['id', 'title', 'message'], 'required'],
            [['message'], 'string'],
            [['is_read'], 'integer'],
            [['created_at'], 'safe'],
            [['id'], 'string', 'max' => 64],
            [['recipient'], 'string', 'max' => 100],
            [['title', 'link'], 'string', 'max' => 255],
            [['recipient'], 'default', 'value' => 'all'],
            [['is_read'], 'default', 'value' => 0],
        ];
    }
}
