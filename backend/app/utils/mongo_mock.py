"""
Supabase PostgreSQL Proxy Stub for Legacy Mongo Mock imports.
"""

class MongoMockWrapper:
    class DummyDB:
        def __getattr__(self, name):
            class DummyCollection:
                def __getattr__(self, subname):
                    return lambda *args, **kwargs: None
                def find(self, *args, **kwargs):
                    return []
                def find_one(self, *args, **kwargs):
                    return None
                def count_documents(self, *args, **kwargs):
                    return 0
                def update_one(self, *args, **kwargs):
                    return None
                def update_many(self, *args, **kwargs):
                    return None
                def insert_one(self, *args, **kwargs):
                    class DummyResult:
                        inserted_id = "00000000-0000-0000-0000-000000000000"
                    return DummyResult()
                def delete_one(self, *args, **kwargs):
                    return None
                def delete_many(self, *args, **kwargs):
                    return None
            return DummyCollection()

    def __init__(self):
        self.db = self.DummyDB()

    def init_app(self, app):
        pass
