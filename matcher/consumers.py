from channels.generic.websocket import AsyncWebsocketConsumer


class MatcherConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        self.unique_group = "user_{}".format(self.user.username)

        if self.user.is_anonymous:
            await self.close()
        else:
            await self.channel_layer.group_add(self.unique_group, self.channel_name)
            await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.unique_group, self.channel_name)

    async def match_created_notification(self, event):
        await self.send("User has a new match.")

    async def match_deleted_notification(self, event):
        await self.send("User's current meeting has been terminated.")
