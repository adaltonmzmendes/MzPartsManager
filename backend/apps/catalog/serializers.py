from rest_framework import serializers
from .models import Item, Conversion, Tag, Application


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

    def update(self, instance, validated_data):
        conversions_data = validated_data.pop('conversions_input', None)
        tags_data = validated_data.pop('tags_input', None)
        applications_data = validated_data.pop('applications_input', None)

        instance = super().update(instance, validated_data)

        if conversions_data is not None:
            objs = []
            for value in conversions_data:
                obj, _ = Conversion.objects.get_or_create(
                    name=value.strip()
                )
                objs.append(obj)
            instance.conversions.set(objs)

        if tags_data is not None:
            objs = []
            for value in tags_data:
                obj, _ = Tag.objects.get_or_create(
                    name=value.strip()
                )
                objs.append(obj)
            instance.tags.set(objs)

        if applications_data is not None:
            objs = []
            for value in applications_data:
                obj, _ = Application.objects.get_or_create(
                    name=value.strip()
                )
                objs.append(obj)
            instance.applications.set(objs)

        return instance
