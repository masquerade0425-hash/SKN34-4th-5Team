from django.test import TestCase
from rest_framework.test import APIClient

from accounts.member_level import member_level_for_points
from accounts.models import CustomUser, PointTransaction, PointWallet


class MemberLevelTests(TestCase):
    def test_boundaries(self):
        for points, expected in [(-1, 1), (0, 1), (500, 1), (501, 2), (1000, 2), (1001, 3), (10**12, 3)]:
            with self.subTest(points=points):
                self.assertEqual(member_level_for_points(points), expected)

    def test_api_derives_level_for_members_staff_and_superusers_without_writes(self):
        client = APIClient()
        for role, staff, superuser in [('member', False, False), ('staff', True, False), ('admin', True, True)]:
            user = CustomUser.objects.create_user(username=role, is_staff=staff, is_superuser=superuser)
            client.force_authenticate(user)
            self.assertEqual(client.get('/api/v1/fantasy/points/').data, {'balance': 0, 'level': 1, 'transactions': []})
            self.assertFalse(PointWallet.objects.filter(user=user).exists())
            wallet = PointWallet.objects.create(user=user)
            for points, expected in [(500, 1), (501, 2), (1000, 2), (1001, 3), (500, 1)]:
                with self.subTest(role=role, points=points):
                    wallet.balance = points
                    wallet.save(update_fields=['balance'])
                    response = client.get('/api/v1/fantasy/points/')
                    self.assertEqual(response.status_code, 200)
                    self.assertEqual(response.data, {'balance': points, 'level': expected, 'transactions': []})
            self.assertFalse(PointTransaction.objects.filter(user=user).exists())

    def test_anonymous_cannot_read_points_or_level(self):
        self.assertEqual(APIClient().get('/api/v1/fantasy/points/').status_code, 401)
