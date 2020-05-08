from rest_framework import serializers
from matcher.models import Answer, Match
from account.models import CustomUser


class AnswerSerializer(serializers.ModelSerializer):
    recipient = serializers.SlugRelatedField(slug_field='username', queryset=CustomUser.objects.all(), many=False,
                                             required=True)

    class Meta:
        model = Answer
        fields = ['recipient', 'agreed']

    def create(self, validated_data):
        user = self.context['request'].user
        recipient = validated_data['recipient']
        agreed = validated_data['agreed']

        answer = Answer.objects.create(sender_id=user.pk, recipient_id=recipient.pk, agreed=agreed)

        return answer


class CurrentMatchSerializer(serializers.Serializer):
    match_id = serializers.ReadOnlyField()
    first_name = serializers.CharField(max_length=30)
    distance = serializers.DecimalField(max_digits=5, decimal_places=2)
    match_timestamp = serializers.DateTimeField()
    common_tags = serializers.ListField(
        child=serializers.CharField()
    )
