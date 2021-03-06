from django.contrib.auth import authenticate
from rest_framework import serializers
from account.models import CustomUser, Tag
from django.contrib.gis.geos import Point
import datetime



class RegisterSerializer(serializers.ModelSerializer):
    password_repeat = serializers.CharField(style={'input_type': 'password'}, write_only=True)

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password_repeat']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password_repeat']:
            raise serializers.ValidationError("Passwords do not match.")
        return attrs

    def create(self, validated_data):
        user = CustomUser(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
        )

        user.set_password(validated_data['password'])
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(**data)
        if not user or not user.is_active:
            raise serializers.ValidationError("Incorrect credentials provided.")
        return user


class CustomUserSerializer(serializers.ModelSerializer):
    tags = serializers.SerializerMethodField()

    def get_tags(self, obj):
        all_tags = Tag.objects.all()
        tag_dict = {tag.name: False for tag in all_tags}

        user_tags = obj.tags.all()
        
        for tag in user_tags:
            tag_dict[tag.name] = True

        return tag_dict


    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'first_name', 'last_name', 'location_range', 'date_joined', 'tags']


class MatchingCustomUserSerializer(serializers.ModelSerializer):
    distance = serializers.SerializerMethodField()
    common_tags = serializers.SerializerMethodField()

    def get_distance(self, obj):
        return obj.distance.km

    def get_common_tags(self, obj):
        user = self.context['request'].user
        common_tags = user.tags.all() & obj.tags.all()
        return [tag.name for tag in common_tags]


    class Meta:
        model = CustomUser
        fields = [
            'username',
            'first_name', 
            'distance',
            'common_tags'
        ]


class PasswordUpdateSerializer(serializers.ModelSerializer):
    new_password = serializers.CharField(style={'input_type': 'password'}, write_only=True, required=True)
    new_password_repeat = serializers.CharField(style={'input_type': 'password'}, write_only=True, required=True)

    class Meta:
        model = CustomUser
        fields = ['password', 'new_password', 'new_password_repeat']

    def validate_password(self, value):
        if not self.instance.check_password(value):
            raise serializers.ValidationError("Incorrect password")

        return value

    def validate(self, data):
        if data['new_password'] != data['new_password_repeat']:
            raise serializers.ValidationError("Passwords have to match.")

        return data

    def update(self, instance, validated_data):
        instance.set_password(validated_data['new_password'])
        instance.save()

        return instance


class DetailsUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['first_name', 'last_name', 'location_range']

    def validate(self, data):
        instance = self.instance

        if not (instance.first_name != data['first_name']
                or instance.last_name != data['last_name']
                or instance.location_range != data['location_range']):
            raise serializers.ValidationError("At least one field has to differ.")

        return data

    def update(self, instance, validated_data):
        instance.first_name = validated_data['first_name']
        instance.last_name = validated_data['last_name']
        instance.location_range = validated_data['location_range']

        instance.save()
        return instance


class CustomUserLocationSerializer(serializers.ModelSerializer):
    # latitude = serializers.DecimalField(max_digits=20, decimal_places=18,
    #                                     min_value=0, max_value=90, write_only=True, required=True)
    # longitude = serializers.DecimalField(max_digits=20, decimal_places=18,
    #                                      min_value=0, max_value=90, write_only=True, required=True)
    latitude = serializers.FloatField(min_value=-90, max_value=90, write_only=True, required=True)
    longitude = serializers.FloatField(min_value=-90, max_value=90, write_only=True, required=True)
    location_timestamp = serializers.IntegerField(required=True)

    class Meta:
        model = CustomUser
        fields = ['latitude', 'longitude', 'location_timestamp']

    def validate_location_timestamp(self, data):
        return data / 1000

    def update(self, instance, validated_data):
        instance.location = Point(x=validated_data['longitude'], y=validated_data['latitude'])
        instance.location_timestamp = datetime.datetime.utcfromtimestamp(validated_data['location_timestamp'])

        instance.save(update_fields=['location', 'location_timestamp'])
        return instance


class TagsUpdateSerializer(serializers.ModelSerializer):
    tags = serializers.DictField(child=serializers.BooleanField())
    
    class Meta:
        model = CustomUser
        fields = ['tags']

    def validate(self, data):
        all_tags = Tag.objects.all()
        all_tag_dict = {tag.name: False for tag in all_tags}

        if set(all_tag_dict.keys()) != set(data['tags'].keys()):
            raise serializers.ValidationError("Set of tags is not valid.")

        return data

    def update(self, instance, validated_data):
        all_tags = Tag.objects.all()
        old_tag_dict = {tag.name: False for tag in all_tags}
        user_tags = instance.tags.all()
        
        for tag in user_tags:
            old_tag_dict[tag.name] = True

        new_tag_dict = validated_data['tags']

        for tag in all_tags:
            if new_tag_dict[tag.name] is True and old_tag_dict[tag.name] is False:
                instance.tags.add(tag)

            if new_tag_dict[tag.name] is False and old_tag_dict[tag.name] is True:
                instance.tags.remove(tag)

        instance.save()
        return instance