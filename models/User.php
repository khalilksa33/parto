<?php

namespace app\models;

use Yii;
use yii\db\ActiveRecord;
use yii\web\IdentityInterface;

/**
 * User ActiveRecord Model
 *
 * @property string $id
 * @property string|null $tenant_id
 * @property string $name
 * @property string $email
 * @property string $password_hash
 * @property string $role
 * @property string $status
 * @property string $created_at
 */
class User extends ActiveRecord implements IdentityInterface
{
    public static function tableName()
    {
        return 'users';
    }

    public function rules()
    {
        return [
            [['id', 'name', 'email', 'password_hash'], 'required'],
            [['created_at'], 'safe'],
            [['id', 'tenant_id'], 'string', 'max' => 64],
            [['name', 'email', 'password_hash'], 'string', 'max' => 255],
            [['role', 'status'], 'string', 'max' => 50],
            [['email'], 'unique'],
            [['email'], 'email'],
            [['role'], 'default', 'value' => 'vendor'],
            [['status'], 'default', 'value' => 'active'],
        ];
    }

    public static function findIdentity($id)
    {
        return static::findOne(['id' => $id, 'status' => 'active']);
    }

    public static function findIdentityByAccessToken($token, $type = null)
    {
        return null;
    }

    public static function findByEmail($email)
    {
        return static::findOne(['email' => $email, 'status' => 'active']);
    }

    public function getId()
    {
        return $this->id;
    }

    public function getAuthKey()
    {
        return md5($this->id . $this->password_hash);
    }

    public function validateAuthKey($authKey)
    {
        return $this->getAuthKey() === $authKey;
    }

    public function validatePassword($password)
    {
        return Yii::$app->security->validatePassword($password, $this->password_hash);
    }

    public function setPassword($password)
    {
        $this->password_hash = Yii::$app->security->generatePasswordHash($password);
    }
}
