from rest_framework import serializers
from .models import Item, Conversion, Tag, Application, GlobalItem, ItemApplication
from apps.catalog.utils import normalize_description, normalize_name
from apps.catalog.services.auto_tags import apply_auto_tags
from apps.inventory.serializers import InventoryItemSerializer

class GlobalItemSuggestionSerializer(serializers.ModelSerializer):
    conversions = serializers.SlugRelatedField(many=True, read_only=True, slug_field='name')
    tags = serializers.SlugRelatedField(many=True, read_only=True, slug_field='name')
    applications = serializers.SlugRelatedField(many=True, read_only=True, slug_field='name')

    class Meta:
        model = GlobalItem
        fields = ['id', 'normalized_description', 'conversions', 'tags', 'applications']


class ItemSerializer(serializers.ModelSerializer):
    conversions = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    applications = serializers.SerializerMethodField()
    
    conversions_input = serializers.ListField(child=serializers.CharField(), write_only=True, required=False)
    tags_input = serializers.ListField(child=serializers.CharField(), write_only=True, required=False)
    applications_input = serializers.ListField(child=serializers.CharField(), write_only=True, required=False)

    inventory = InventoryItemSerializer(read_only=True)

    class Meta:
        model = Item
        fields = [
            'id', 'description', 'inventory', 'conversions', 'conversions_input', 
            'tags', 'tags_input', 'applications', 'applications_input'
        ]

    def validate_description(self, value):
        return normalize_description(value, to_lower=False)

    def validate(self, attrs):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            description = attrs.get('description', getattr(self.instance, 'description', None))
            
            if description:
                qs = Item.objects.filter(company=request.user.company, description=description)
                if self.instance:
                    qs = qs.exclude(pk=self.instance.pk)
                
                if qs.exists():
                    raise serializers.ValidationError(
                        {"description": "Já existe um item com esta descrição no seu catálogo."}
                    )
        return attrs

    def get_conversions(self, obj):
        return list(obj.conversions.values_list('name', flat=True))

    def get_tags(self, obj):
        return list(obj.tags.values_list('name', flat=True))

    def get_applications(self, obj):
        return list(obj.applications.order_by('itemapplication__order').values_list('name', flat=True))

    def _sync_m2m(self, instance, conversions, tags, applications):
        if conversions is not None:
            instance.conversions.set([
                Conversion.objects.get_or_create(name=norm_name)[0] 
                for v in conversions if (norm_name := normalize_name(v))
            ])
        
        if tags is not None:
            instance.tags.set([
                Tag.objects.get_or_create(name=norm_name)[0] 
                for v in tags if (norm_name := normalize_name(v))
            ])
            
        if applications is not None:
            ItemApplication.objects.filter(item=instance).delete()
            ItemApplication.objects.bulk_create([
                ItemApplication(
                    item=instance,
                    application=Application.objects.get_or_create(name=app_name.strip())[0],
                    order=index
                )
                for index, app_name in enumerate(applications) if app_name.strip()
            ])
            
        apply_auto_tags(instance)

    def create(self, validated_data):
        convs = validated_data.pop('conversions_input', None)
        tags = validated_data.pop('tags_input', None)
        apps = validated_data.pop('applications_input', None)

        instance = super().create(validated_data)
        self._sync_m2m(instance, convs, tags, apps)
        return instance

    def update(self, instance, validated_data):
        convs = validated_data.pop('conversions_input', None)
        tags = validated_data.pop('tags_input', None)
        apps = validated_data.pop('applications_input', None)

        instance = super().update(instance, validated_data)
        self._sync_m2m(instance, convs, tags, apps)
        return instance