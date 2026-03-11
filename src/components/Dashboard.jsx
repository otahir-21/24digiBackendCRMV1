import { useState, useEffect, useMemo } from 'react';
import { useFirestoreCollections, useCollectionData } from '../hooks/useFirestore';
import { useAllProductsData } from '../hooks/useAllProductsData';
import { getCollectionDisplayName, groupByModule, isModuleCollection } from '../utils/displayNames';
import { ALL_PRODUCTS_VIEW } from '../constants';
import DashboardHeader from './DashboardHeader';
import DataTable from './DataTable';
import ProductsView from './ProductsView';
import './Dashboard.css';

export default function Dashboard() {
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});

  const { collections, loading: collectionsLoading } = useFirestoreCollections();
  const isProductsView = selectedCollection === ALL_PRODUCTS_VIEW;
  const { data, loading: dataLoading, error, refetch } = useCollectionData(
    isProductsView ? null : selectedCollection
  );
  const productsData = useAllProductsData();

  const allCollections = collections;

  const { modules, otherCollections } = useMemo(() => {
    const moduleCols = allCollections.filter(isModuleCollection);
    const others = allCollections.filter((c) => !isModuleCollection(c));
    const moduleMap = groupByModule(moduleCols);
    return { modules: moduleMap, otherCollections: others };
  }, [allCollections]);

  const moduleNames = Object.keys(modules);

  useEffect(() => {
    if (selectedCollection) return;
    if (moduleNames.length > 0 && modules[moduleNames[0]]?.length > 0) {
      setSelectedCollection(ALL_PRODUCTS_VIEW);
      setExpandedModules({ [moduleNames[0]]: true });
    } else if (otherCollections.includes('users')) {
      setSelectedCollection('users');
    } else if (otherCollections.length > 0) {
      setSelectedCollection(otherCollections[0]);
    }
  }, [selectedCollection, moduleNames, modules, otherCollections]);

  const toggleModule = (moduleName) => {
    setExpandedModules((prev) => ({ ...prev, [moduleName]: !prev[moduleName] }));
  };

  const loading = collectionsLoading || dataLoading;

  return (
    <div className="dashboard">
      <DashboardHeader />

      <main className="dashboard-main">
        <aside className="sidebar">
          <h3>Menu</h3>
          {collectionsLoading ? (
            <p className="sidebar-loading">Loading...</p>
          ) : (
            <ul className="collection-list">
              {moduleNames.map((moduleName) => {
                const items = modules[moduleName];
                const isExpanded = expandedModules[moduleName] !== false;
                return (
                  <li key={moduleName} className="module-group">
                    <button
                      className="module-header"
                      onClick={() => toggleModule(moduleName)}
                    >
                      <span className="module-chevron">{isExpanded ? '▼' : '▶'}</span>
                      <span className="module-name">{moduleName}</span>
                    </button>
                    {isExpanded && (
                      <ul className="module-items">
                        <li className="nav-divider">
                          <span>Products</span>
                        </li>
                        <li>
                          <button
                            className={`collection-btn ${selectedCollection === ALL_PRODUCTS_VIEW ? 'active' : ''}`}
                            onClick={() => setSelectedCollection(ALL_PRODUCTS_VIEW)}
                          >
                            <span className="nav-icon">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <polyline points="10 9 9 9 8 9" />
                              </svg>
                            </span>
                            All Products
                          </button>
                        </li>
                        {items.map((item) => (
                          <li key={item.fullName}>
                            <button
                              className={`collection-btn ${selectedCollection === item.fullName ? 'active' : ''}`}
                              onClick={() => setSelectedCollection(item.fullName)}
                            >
                              <span className="nav-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M20 7h-9" />
                                  <path d="M14 17H5" />
                                  <circle cx="17" cy="17" r="3" />
                                  <circle cx="7" cy="7" r="3" />
                                </svg>
                              </span>
                              {item.display}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}

              {otherCollections.length > 0 && (
                <>
                  <li className="nav-divider">
                    <span>Data</span>
                  </li>
                  {otherCollections.map((col) => (
                    <li key={col}>
                      <button
                        className={`collection-btn ${selectedCollection === col ? 'active' : ''}`}
                        onClick={() => setSelectedCollection(col)}
                      >
                        <span className="nav-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <ellipse cx="12" cy="5" rx="9" ry="3" />
                            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                          </svg>
                        </span>
                        {getCollectionDisplayName(col)}
                      </button>
                    </li>
                  ))}
                </>
              )}
            </ul>
          )}
          {allCollections.length === 0 && !collectionsLoading && (
            <p className="sidebar-empty">No collections found.</p>
          )}
        </aside>

        <section className="content">
          {selectedCollection === ALL_PRODUCTS_VIEW ? (
            <>
              <div className="content-header">
                <h2>Products</h2>
                <button onClick={productsData.refetch} className="refresh-btn">Refresh</button>
              </div>
              <ProductsView {...productsData} />
            </>
          ) : selectedCollection && (
            <>
              <div className="content-header">
                <h2>{getCollectionDisplayName(selectedCollection)}</h2>
                <button onClick={refetch} className="refresh-btn">Refresh</button>
              </div>

              {error && <div className="content-error">{error}</div>}

              {dataLoading ? (
                <div className="content-loading">Loading data...</div>
              ) : data.length === 0 ? (
                <div className="content-empty">No documents in this collection.</div>
              ) : (
                <DataTable
                  data={data}
                  collectionName={selectedCollection}
                  onUpdate={refetch}
                />
              )}
            </>
          )}

          {!selectedCollection && !loading && (
            <div className="content-placeholder">
              <p>Select a collection from the sidebar to view your data.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
