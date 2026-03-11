import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { DEFAULT_COLLECTIONS, DIET_COLLECTIONS } from '../constants';

const ALL_COLLECTIONS_TO_CHECK = [...DEFAULT_COLLECTIONS, ...DIET_COLLECTIONS];

export function useFirestoreCollections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled(
        ALL_COLLECTIONS_TO_CHECK.map((name) =>
          getDocs(collection(db, name)).then(() => name)
        )
      );

      const valid = results
        .filter((r) => r.status === 'fulfilled')
        .map((r) => r.value);

      setCollections(valid.length > 0 ? valid : ['users']);
    } catch (err) {
      setError('Could not connect to Firestore. Check your Firebase config.');
      setCollections(['users']);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  return { collections, loading, error, refetch: fetchCollections };
}

export function useCollectionData(collectionName) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!collectionName) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setData(items);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [collectionName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
