<?php

namespace app\models;

use Yii;
use yii\db\ActiveRecord;

/**
 * Product ActiveRecord Model
 *
 * @property string $id
 * @property string $tenant_id
 * @property string $name
 * @property string $brand_name
 * @property string|null $oem_part_number
 * @property float $price
 * @property string $category
 * @property string|null $description
 * @property string|null $compatibility
 * @property string $status
 * @property string|null $image
 * @property float $rating
 * @property int $featured
 * @property float $weight
 * @property float $length
 * @property float $width
 * @property float $height
 * @property int $stock_quantity
 * @property string $created_at
 *
 * @property Tenant $tenant
 */
class Product extends ActiveRecord
{
    public static function tableName()
    {
        return 'products';
    }

    public function rules()
    {
        return [
            [['id', 'tenant_id', 'name', 'brand_name', 'category'], 'required'],
            [['price', 'rating', 'weight', 'length', 'width', 'height'], 'number'],
            [['featured', 'stock_quantity'], 'integer'],
            [['description', 'compatibility', 'image'], 'string'],
            [['created_at'], 'safe'],
            [['id', 'tenant_id'], 'string', 'max' => 64],
            [['name'], 'string', 'max' => 255],
            [['brand_name', 'oem_part_number', 'category', 'status'], 'string', 'max' => 100],
            [['status'], 'default', 'value' => 'active'],
            [['rating'], 'default', 'value' => 4.90],
            [['stock_quantity'], 'default', 'value' => 25],
        ];
    }

    public function attributeLabels()
    {
        $isRtl = Yii::$app->language === 'ar';
        return [
            'id' => 'ID',
            'tenant_id' => $isRtl ? 'الموزع / التاجر' : 'Distributor / Vendor',
            'name' => $isRtl ? 'اسم القطعة' : 'Part Name',
            'brand_name' => $isRtl ? 'الشركة المصنعة' : 'Vehicle Make',
            'oem_part_number' => $isRtl ? 'رقم القطعة الأصلي (OEM)' : 'OEM Part Number',
            'price' => $isRtl ? 'السعر (ر.س)' : 'Price (SAR)',
            'category' => $isRtl ? 'القسم' : 'Category',
            'description' => $isRtl ? 'الوصف' : 'Description',
            'compatibility' => $isRtl ? 'التوافق' : 'Compatibility',
            'status' => $isRtl ? 'الحالة' : 'Status',
            'stock_quantity' => $isRtl ? 'الكمية المتاحة' : 'Stock Quantity',
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getTenant()
    {
        return $this->hasOne(Tenant::class, ['id' => 'tenant_id']);
    }

    /**
     * Compatibility list helper
     */
    public function getCompatibilityList(): array
    {
        if (empty($this->compatibility)) {
            return [];
        }
        $decoded = json_decode($this->compatibility, true);
        return is_array($decoded) ? $decoded : [];
    }

    /**
     * Formatted price helper
     */
    public function getFormattedPrice($lang = null): string
    {
        $lang = $lang ?: (Yii::$app->language ?? 'ar');
        $formatted = number_format((float)$this->price, 2);
        return $lang === 'ar' ? "{$formatted} ر.س" : "SAR {$formatted}";
    }

    public function isInStock(): bool
    {
        return (int)$this->stock_quantity > 0;
    }

    /**
     * Scopes
     */
    public static function findActive()
    {
        return static::find()->where(['status' => 'active']);
    }

    public static function findFeatured()
    {
        return static::findActive()->andWhere(['featured' => 1])->orderBy(['created_at' => SORT_DESC]);
    }
}
