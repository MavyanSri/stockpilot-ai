import React, { useState, useEffect } from 'react';
import { api } from '../api/api';
import { Icon } from '../components/Icons';

export const AiAssistantPage = ({ onNavigate, showToast }) => {
  const [activeSubTab, setActiveSubTab] = useState('ask'); // 'ask' | 'recommendations' | 'forecast' | 'insights'
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Ask AI State
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [asking, setAsking] = useState(false);

  // Recommendations State
  const [recommendations, setRecommendations] = useState(null);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Forecast State
  const [forecastProductId, setForecastProductId] = useState('');
  const [forecastDays, setForecastDays] = useState('7');
  const [forecastData, setForecastData] = useState(null);
  const [loadingForecast, setLoadingForecast] = useState(false);

  // Insights State
  const [insightProductId, setInsightProductId] = useState('');
  const [insightData, setInsightData] = useState(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        setLoadingProducts(true);
        const prods = await api.getProducts();
        setProducts(prods || []);
        if (prods && prods.length > 0) {
          setForecastProductId(String(prods[0].id));
          setInsightProductId(String(prods[0].id));
        }
      } catch (err) {
        showToast(err.message || 'Failed to load products for AI', 'error');
      } finally {
        setLoadingProducts(false);
      }
    }
    init();
  }, []);

  // Load recommendations when switching to recommendations tab
  useEffect(() => {
    if (activeSubTab === 'recommendations' && !recommendations) {
      loadRecommendations();
    }
  }, [activeSubTab]);

  const loadRecommendations = async () => {
    try {
      setLoadingRecs(true);
      const res = await api.getPurchaseRecommendations();
      setRecommendations(res);
    } catch (err) {
      showToast(err.message || 'Failed to get recommendations', 'error');
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleAsk = async (promptText = question) => {
    const q = promptText.trim();
    if (!q) return;

    setAsking(true);
    try {
      const res = await api.askAi(q);
      setAiResponse(res);
    } catch (err) {
      showToast(err.message || 'AI request failed', 'error');
    } finally {
      setAsking(false);
    }
  };

  const handleForecast = async (e) => {
    if (e) e.preventDefault();
    if (!forecastProductId) return;

    setLoadingForecast(true);
    try {
      const res = await api.getDemandForecast(Number(forecastProductId), Number(forecastDays));
      setForecastData(res);
    } catch (err) {
      showToast(err.message || 'Demand forecast failed', 'error');
    } finally {
      setLoadingForecast(false);
    }
  };

  const handleInsight = async (e) => {
    if (e) e.preventDefault();
    if (!insightProductId) return;

    setLoadingInsight(true);
    try {
      const res = await api.getStockInsights(Number(insightProductId));
      setInsightData(res);
    } catch (err) {
      showToast(err.message || 'Stock insights failed', 'error');
    } finally {
      setLoadingInsight(false);
    }
  };

  const sampleQuestions = [
    "What were the top selling products in the last 7 days?",
    "Show me all low stock products right now",
    "How much sales revenue did we generate today?",
    "Which products need urgent reordering from suppliers?",
    "Give me an overview of warehouse inventory"
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="page-title">StockPilot AI Decision Intelligence</h2>
            <span className="badge badge-ai">POWERED BY AI</span>
          </div>
          <p className="page-subtitle">Algorithmic demand forecasting, smart reordering advice, and natural language analytics</p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="ai-tabs-nav">
        <button
          className={`ai-tab-btn ${activeSubTab === 'ask' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('ask')}
        >
          <Icon name="sparkles" size={16} />
          <span>Natural Language Assistant</span>
        </button>
        <button
          className={`ai-tab-btn ${activeSubTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('recommendations')}
        >
          <Icon name="orders" size={16} />
          <span>Purchase Recommendations</span>
        </button>
        <button
          className={`ai-tab-btn ${activeSubTab === 'forecast' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('forecast')}
        >
          <Icon name="reports" size={16} />
          <span>Demand Forecast</span>
        </button>
        <button
          className={`ai-tab-btn ${activeSubTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('insights')}
        >
          <Icon name="alert" size={16} />
          <span>Stock Risk Analysis</span>
        </button>
      </div>

      {/* 1. Ask AI Assistant */}
      {activeSubTab === 'ask' && (
        <div className="ai-content-section">
          <div className="card ai-chat-card">
            <div className="card-header">
              <div className="card-header-left">
                <Icon name="sparkles" size={20} color="#ec4899" />
                <h3>Ask Inventory Assistant</h3>
              </div>
              <span className="text-muted text-xs">Grounded in live warehouse records</span>
            </div>

            <div className="card-body">
              <div className="sample-prompts-container">
                <span className="text-muted text-xs">Suggested inquiries:</span>
                <div className="prompts-pills">
                  {sampleQuestions.map((qText, i) => (
                    <button
                      key={i}
                      className="prompt-pill"
                      onClick={() => {
                        setQuestion(qText);
                        handleAsk(qText);
                      }}
                      disabled={asking}
                    >
                      {qText}
                    </button>
                  ))}
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAsk();
                }}
                className="ai-input-form"
              >
                <input
                  type="text"
                  placeholder="Ask any question about sales, trends, reorders, or low stock..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={asking}
                />
                <button type="submit" className="btn btn-primary" disabled={asking || !question.trim()}>
                  {asking ? <span className="spinner"></span> : <Icon name="send" size={16} />}
                  <span>{asking ? 'Analyzing...' : 'Ask AI'}</span>
                </button>
              </form>

              {aiResponse && (
                <div className="ai-response-box">
                  <div className="ai-response-header">
                    <div className="flex items-center gap-2">
                      <Icon name="sparkles" size={18} color="#ec4899" />
                      <strong className="text-slate-100">AI Response & Inventory Analysis</strong>
                    </div>
                    <span className="badge badge-info">
                      Scope: {aiResponse.report}
                    </span>
                  </div>

                  <div className="ai-answer-prose">
                    {aiResponse.answer}
                  </div>

                  {aiResponse.data && (
                    <div className="ai-facts-box">
                      <span className="facts-label">Grounded Evidence Data:</span>
                      <pre className="facts-json">{JSON.stringify(aiResponse.data, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Purchase Recommendations */}
      {activeSubTab === 'recommendations' && (
        <div className="ai-content-section">
          <div className="card">
            <div className="card-header">
              <div className="card-header-left">
                <Icon name="orders" size={20} color="#38bdf8" />
                <div>
                  <h3>Algorithmic Reorder Recommendations</h3>
                  <span className="text-muted text-xs">
                    Target = ceil(daily velocity &times; supplier lead days) + safety stock
                  </span>
                </div>
              </div>
              <button className="btn btn-outline btn-sm" onClick={loadRecommendations} disabled={loadingRecs}>
                Recalculate
              </button>
            </div>

            <div className="card-body">
              {recommendations?.explanation && (
                <div className="ai-explanation-banner">
                  <Icon name="sparkles" size={20} color="#ec4899" />
                  <div>
                    <strong>AI Executive Summary ({recommendations.source}):</strong>
                    <p>{recommendations.explanation}</p>
                  </div>
                </div>
              )}

              {loadingRecs ? (
                <div className="table-loading"><span className="spinner"></span> Computing lead times & reorder levels...</div>
              ) : !recommendations?.data || recommendations.data.length === 0 ? (
                <div className="empty-state">
                  <Icon name="checkCircle" size={40} color="#10b981" />
                  <h4>No Purchases Currently Recommended</h4>
                  <p>All items have sufficient on-hand inventory + open incoming supplier orders to cover lead-time demand.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Supplier</th>
                        <th>Current On Hand</th>
                        <th>Lead Time</th>
                        <th>Incoming Orders</th>
                        <th>Target Stock</th>
                        <th>Suggested Order</th>
                        <th>Risk Assessment</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recommendations.data.map((r) => (
                        <tr key={r.productId}>
                          <td className="font-medium text-slate-100">{r.name}</td>
                          <td>{r.supplier}</td>
                          <td>{r.currentStock} units</td>
                          <td>{r.leadTimeDays} days</td>
                          <td>{r.incomingUnits} units</td>
                          <td className="font-medium text-slate-200">{r.targetStock}</td>
                          <td className="font-bold text-amber-400">
                            +{r.suggestedQuantity} units
                          </td>
                          <td>
                            <span className={`badge ${r.risk === 'COVERED' ? 'badge-success' : r.risk === 'AT_RISK_BEFORE_DELIVERY' ? 'badge-danger' : 'badge-warning'}`}>
                              {r.risk.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-primary btn-xs"
                              onClick={() => onNavigate('orders')}
                              title="Go to Purchase Orders"
                            >
                              Create PO &rarr;
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Demand Forecast */}
      {activeSubTab === 'forecast' && (
        <div className="ai-content-section">
          <div className="card">
            <div className="card-header">
              <div className="card-header-left">
                <Icon name="reports" size={20} color="#38bdf8" />
                <h3>Statistical Demand Projection</h3>
              </div>
            </div>

            <div className="card-body">
              <form onSubmit={handleForecast} className="forecast-controls-form">
                <div className="form-group flex-2">
                  <label htmlFor="f-prod">Select Product</label>
                  <select
                    id="f-prod"
                    value={forecastProductId}
                    onChange={(e) => setForecastProductId(e.target.value)}
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.sku} - {p.name} (Stock: {p.currentStock})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group flex-1">
                  <label htmlFor="f-days">Forecast Horizon (Days)</label>
                  <select
                    id="f-days"
                    value={forecastDays}
                    onChange={(e) => setForecastDays(e.target.value)}
                  >
                    <option value="7">7 Days Ahead</option>
                    <option value="14">14 Days Ahead</option>
                    <option value="30">30 Days Ahead</option>
                  </select>
                </div>

                <div className="form-group flex-none flex-align-end">
                  <button type="submit" className="btn btn-primary" disabled={loadingForecast || !forecastProductId}>
                    {loadingForecast ? 'Forecasting...' : 'Compute Forecast'}
                  </button>
                </div>
              </form>

              {forecastData && (
                <div className="forecast-results-container">
                  <div className="stats-grid">
                    <div className="stat-card stat-blue">
                      <span className="stat-title">Observed History</span>
                      <div className="stat-value">{forecastData.observedDays} days</div>
                      <span className="stat-subtitle">Recent calendar window</span>
                    </div>
                    <div className="stat-card stat-emerald">
                      <span className="stat-title">Daily Sales Velocity</span>
                      <div className="stat-value">{Number(forecastData.dailyAverage || 0).toFixed(2)}</div>
                      <span className="stat-subtitle">Units / day mean rate</span>
                    </div>
                    <div className="stat-card stat-amber">
                      <span className="stat-title">Projected Demand</span>
                      <div className="stat-value">{forecastData.projectedUnits} units</div>
                      <span className="stat-subtitle">Over next {forecastData.days} days</span>
                    </div>
                  </div>

                  <div className="forecast-method-note">
                    <Icon name="sparkles" size={16} color="#38bdf8" />
                    <span>{forecastData.method}</span>
                  </div>

                  <div className="forecast-history-table">
                    <h4>Observed Day-by-Day Historical Sales</h4>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Units Sold</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(forecastData.history || []).map((h, i) => (
                          <tr key={i}>
                            <td className="text-slate-200">{h.date}</td>
                            <td className="font-semibold text-emerald-400">+{h.units} units</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Stock Risk Analysis */}
      {activeSubTab === 'insights' && (
        <div className="ai-content-section">
          <div className="card">
            <div className="card-header">
              <div className="card-header-left">
                <Icon name="alert" size={20} color="#f43f5e" />
                <h3>Stockout Risk & Lead-Time Analysis</h3>
              </div>
            </div>

            <div className="card-body">
              <form onSubmit={handleInsight} className="forecast-controls-form">
                <div className="form-group flex-2">
                  <label htmlFor="i-prod">Select Product</label>
                  <select
                    id="i-prod"
                    value={insightProductId}
                    onChange={(e) => setInsightProductId(e.target.value)}
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.sku} - {p.name} (Stock: {p.currentStock})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group flex-none flex-align-end">
                  <button type="submit" className="btn btn-primary" disabled={loadingInsight || !insightProductId}>
                    {loadingInsight ? 'Analyzing...' : 'Generate Risk Assessment'}
                  </button>
                </div>
              </form>

              {insightData && (
                <div className="insight-results-box">
                  <div className="ai-explanation-banner">
                    <Icon name="sparkles" size={22} color="#ec4899" />
                    <div>
                      <strong>AI Risk Summary ({insightData.source}):</strong>
                      <p className="text-base text-slate-100 mt-1">{insightData.explanation}</p>
                    </div>
                  </div>

                  {insightData.data && (
                    <div className="insight-metrics-grid">
                      <div className="insight-metric-card">
                        <span className="text-muted text-xs">Risk Category</span>
                        <div className="mt-1">
                          <span className={`badge ${insightData.data.risk === 'COVERED' ? 'badge-success' : insightData.data.risk === 'AT_RISK_BEFORE_DELIVERY' ? 'badge-danger' : 'badge-warning'}`}>
                            {insightData.data.risk?.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="insight-metric-card">
                        <span className="text-muted text-xs">Current On Hand</span>
                        <div className="metric-val">{insightData.data.currentStock} units</div>
                      </div>
                      <div className="insight-metric-card">
                        <span className="text-muted text-xs">Supplier Lead Time</span>
                        <div className="metric-val">{insightData.data.leadTimeDays} days</div>
                      </div>
                      <div className="insight-metric-card">
                        <span className="text-muted text-xs">Days of Stock Cover</span>
                        <div className="metric-val">
                          {insightData.data.daysOfStock != null ? `${Number(insightData.data.daysOfStock).toFixed(1)} days` : 'No Recent Sales'}
                        </div>
                      </div>
                      <div className="insight-metric-card">
                        <span className="text-muted text-xs">Incoming Due Units</span>
                        <div className="metric-val">+{insightData.data.incomingUnits} units</div>
                      </div>
                      <div className="insight-metric-card">
                        <span className="text-muted text-xs">Reorder Needed</span>
                        <div className="metric-val text-amber-400">
                          {insightData.data.suggestedQuantity > 0 ? `+${insightData.data.suggestedQuantity} units` : '0 (Covered)'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
