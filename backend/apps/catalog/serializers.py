from rest_framework import serializers
from .models import Item, Conversion, Tag, Application, GlobalItem
from apps.catalog.utils import normalize_description


class GlobalItemSuggestionSerializer(serializers.ModelSerializer):
    conversions = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='name'
    )
    tags = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='name'
    )
    applications = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='name'
    )

    class Meta:
        model = GlobalItem
        fields = [
            'id',
            'normalized_description',
            'conversions',
            'tags',
            'applications',
        ]


class ItemSerializer(serializers.ModelSerializer):
    conversions = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    applications = serializers.SerializerMethodField()

    conversions_input = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False
    )
    tags_input = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False
    )
    applications_input = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Item
        fields = [
            'id',
            'description',
            'conversions',
            'conversions_input',
            'tags',
            'tags_input',
            'applications',
            'applications_input',
        ]

    def get_conversions(self, obj):
        return list(obj.conversions.values_list('name', flat=True))

    def get_tags(self, obj):
        return list(obj.tags.values_list('name', flat=True))

    def get_applications(self, obj):
        return list(obj.applications.values_list('name', flat=True))

    def create(self, validated_data):
        conversions_data = validated_data.pop('conversions_input', None)
        tags_data = validated_data.pop('tags_input', None)
        applications_data = validated_data.pop('applications_input', None)

        validated_data['description'] = normalize_description(
            validated_data.get('description')
        )

        instance = super().create(validated_data)

        if conversions_data:
            objs = [
                Conversion.objects.get_or_create(name=v.strip())[0]
                for v in conversions_data
            ]
            instance.conversions.add(*objs)

        if tags_data:
            objs = [
                Tag.objects.get_or_create(name=v.strip())[0]
                for v in tags_data
            ]
            instance.tags.set(objs)

        if applications_data:
            objs = [
                Application.objects.get_or_create(name=v.strip())[0]
                for v in applications_data
            ]
            instance.applications.set(objs)

        return instance

    def update(self, instance, validated_data):
        conversions_data = validated_data.pop('conversions_input', None)
        tags_data = validated_data.pop('tags_input', None)
        applications_data = validated_data.pop('applications_input', None)

        if 'description' in validated_data:
            validated_data['description'] = normalize_description(
                validated_data['description']
            )

        instance = super().update(instance, validated_data)

        if conversions_data is not None:
            objs = [
                Conversion.objects.get_or_create(name=v.strip())[0]
                for v in conversions_data
            ]
            
            if instance.description:
                first_token = instance.description.split(" ", 1)[0]
                auto_conv, _ = Conversion.objects.get_or_create(name=first_token)
                if auto_conv not in objs:
                    objs.append(auto_conv)
            
            instance.conversions.set(objs)

        if tags_data is not None:
            objs = [
                Tag.objects.get_or_create(name=v.strip())[0]
                for v in tags_data
            ]
            instance.tags.set(objs)

        if applications_data is not None:
            objs = [
                Application.objects.get_or_create(name=v.strip())[0]
                for v in applications_data
            ]
            instance.applications.set(objs)

        return instance