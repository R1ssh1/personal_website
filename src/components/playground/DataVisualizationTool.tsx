'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DataRow {
  [key: string]: string | number
}

interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'scatter'
  xAxis: string
  yAxis: string
  title: string
}

type FileType = 'csv' | 'json' | null

export default function DataVisualizationTool() {
  const [data, setData] = useState<DataRow[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [fileType, setFileType] = useState<FileType>(null)
  const [fileName, setFileName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    type: 'bar',
    xAxis: '',
    yAxis: '',
    title: 'My Chart'
  })

  const parseCSV = (csvText: string): DataRow[] => {
    const lines = csvText.trim().split('\n')
    if (lines.length === 0) return []

    const headers = lines[0].split(',').map(h => h.trim())
    setColumns(headers)

    const data: DataRow[] = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const row: DataRow = {}

      headers.forEach((header, index) => {
        const value = values[index] || ''
        // Try to parse as number, otherwise keep as string
        const numValue = parseFloat(value)
        row[header] = isNaN(numValue) ? value : numValue
      })

      data.push(row)
    }

    return data
  }

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setError('')
    setFileName(file.name)

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string

        if (file.name.endsWith('.csv')) {
          setFileType('csv')
          const parsedData = parseCSV(content)
          setData(parsedData)
        } else if (file.name.endsWith('.json')) {
          setFileType('json')
          const parsedData = JSON.parse(content)
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            const cols = Object.keys(parsedData[0])
            setColumns(cols)
            setData(parsedData)
          } else {
            throw new Error('JSON file must contain an array of objects')
          }
        } else {
          throw new Error('Unsupported file format. Please upload CSV or JSON files.')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse file')
        setData([])
        setColumns([])
      } finally {
        setIsLoading(false)
      }
    }

    reader.onerror = () => {
      setError('Failed to read file')
      setIsLoading(false)
    }

    reader.readAsText(file)
  }, [])

  const generateSampleData = () => {
    const sampleData = [
      { month: 'January', sales: 12000, expenses: 8000, profit: 4000 },
      { month: 'February', sales: 15000, expenses: 9000, profit: 6000 },
      { month: 'March', sales: 18000, expenses: 10000, profit: 8000 },
      { month: 'April', sales: 14000, expenses: 8500, profit: 5500 },
      { month: 'May', sales: 20000, expenses: 11000, profit: 9000 },
      { month: 'June', sales: 22000, expenses: 12000, profit: 10000 }
    ]

    setData(sampleData)
    setColumns(Object.keys(sampleData[0]))
    setFileName('sample-data.json')
    setFileType('json')
    setChartConfig(prev => ({ ...prev, xAxis: 'month', yAxis: 'sales' }))
  }

  const getNumericColumns = () => {
    return columns.filter(col => {
      return data.some(row => typeof row[col] === 'number')
    })
  }

  const getCategoricalColumns = () => {
    return columns.filter(col => {
      return data.some(row => typeof row[col] === 'string')
    })
  }

  const renderChart = () => {
    if (!chartConfig.xAxis || !chartConfig.yAxis || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 bg-secondary/10 rounded-lg border-2 border-dashed border-secondary/30">
          <p className="text-muted-foreground">Configure chart settings to see visualization</p>
        </div>
      )
    }

    const maxValue = Math.max(...data.map(row => Number(row[chartConfig.yAxis]) || 0))
    const chartHeight = 300

    switch (chartConfig.type) {
      case 'bar':
        return (
          <div className="bg-background border border-secondary/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-foreground mb-4 text-center">{chartConfig.title}</h3>
            <div className="flex items-end space-x-2 h-64 mb-4">
              {data.map((row, index) => {
                const value = Number(row[chartConfig.yAxis]) || 0
                const height = (value / maxValue) * chartHeight

                return (
                  <motion.div
                    key={index}
                    className="flex flex-col items-center flex-1"
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div
                      className="bg-accent hover:bg-accent/80 transition-colors rounded-t w-full flex items-end justify-center relative group cursor-pointer"
                      style={{ height: `${height}px`, minHeight: '20px' }}
                    >
                      <span className="text-white text-xs font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {value}
                      </span>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {row[chartConfig.xAxis]}: {value}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2 text-center truncate w-full">
                      {String(row[chartConfig.xAxis])}
                    </div>
                  </motion.div>
                )
              })}
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>{chartConfig.xAxis}</span>
              <span>{chartConfig.yAxis}</span>
            </div>
          </div>
        )

      case 'line':
        return (
          <div className="bg-background border border-secondary/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-foreground mb-4 text-center">{chartConfig.title}</h3>
            <div className="relative h-64 mb-4">
              <svg className="w-full h-full">
                {/* Grid lines */}
                {[...Array(5)].map((_, i) => (
                  <line
                    key={i}
                    x1="0"
                    y1={`${(i * 25)}%`}
                    x2="100%"
                    y2={`${(i * 25)}%`}
                    stroke="currentColor"
                    strokeOpacity="0.1"
                  />
                ))}

                {/* Line path */}
                <motion.path
                  d={data.map((row, index) => {
                    const x = (index / (data.length - 1)) * 100
                    const y = 100 - ((Number(row[chartConfig.yAxis]) || 0) / maxValue) * 100
                    return `${index === 0 ? 'M' : 'L'} ${x}% ${y}%`
                  }).join(' ')}
                  stroke="rgb(var(--color-accent))"
                  strokeWidth="2"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2 }}
                />

                {/* Data points */}
                {data.map((row, index) => {
                  const x = (index / (data.length - 1)) * 100
                  const y = 100 - ((Number(row[chartConfig.yAxis]) || 0) / maxValue) * 100
                  return (
                    <motion.circle
                      key={index}
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r="4"
                      fill="rgb(var(--color-accent))"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="cursor-pointer"
                    >
                      <title>{`${row[chartConfig.xAxis]}: ${row[chartConfig.yAxis]}`}</title>
                    </motion.circle>
                  )
                })}
              </svg>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>{chartConfig.xAxis}</span>
              <span>{chartConfig.yAxis}</span>
            </div>
          </div>
        )

      case 'pie':
        const total = data.reduce((sum, row) => sum + (Number(row[chartConfig.yAxis]) || 0), 0)
        let currentAngle = 0

        return (
          <div className="bg-background border border-secondary/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-foreground mb-4 text-center">{chartConfig.title}</h3>
            <div className="flex flex-col lg:flex-row items-center justify-center space-y-4 lg:space-y-0 lg:space-x-8">
              <div className="relative">
                <svg width="200" height="200" viewBox="0 0 200 200">
                  {data.map((row, index) => {
                    const value = Number(row[chartConfig.yAxis]) || 0
                    const percentage = (value / total) * 360
                    const startAngle = currentAngle
                    const endAngle = currentAngle + percentage
                    currentAngle += percentage

                    const startAngleRad = (startAngle * Math.PI) / 180
                    const endAngleRad = (endAngle * Math.PI) / 180

                    const largeArcFlag = percentage > 180 ? 1 : 0

                    const x1 = 100 + 80 * Math.cos(startAngleRad)
                    const y1 = 100 + 80 * Math.sin(startAngleRad)
                    const x2 = 100 + 80 * Math.cos(endAngleRad)
                    const y2 = 100 + 80 * Math.sin(endAngleRad)

                    const pathData = [
                      `M 100 100`,
                      `L ${x1} ${y1}`,
                      `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                      'Z'
                    ].join(' ')

                    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316']

                    return (
                      <motion.path
                        key={index}
                        d={pathData}
                        fill={colors[index % colors.length]}
                        stroke="white"
                        strokeWidth="2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="cursor-pointer hover:opacity-80"
                      >
                        <title>{`${row[chartConfig.xAxis]}: ${value} (${((value / total) * 100).toFixed(1)}%)`}</title>
                      </motion.path>
                    )
                  })}
                </svg>
              </div>

              <div className="space-y-2">
                {data.map((row, index) => {
                  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316']
                  const value = Number(row[chartConfig.yAxis]) || 0
                  const percentage = ((value / total) * 100).toFixed(1)

                  return (
                    <div key={index} className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      />
                      <span className="text-sm text-foreground">
                        {String(row[chartConfig.xAxis])}: {value} ({percentage}%)
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex flex-col space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">📊 Data Visualization Tool</h2>
        <p className="text-muted-foreground">Upload CSV/JSON files and create interactive charts</p>
      </div>

      {/* File Upload Section */}
      <div className="bg-secondary/20 rounded-lg p-6 border border-secondary/30">
        <h3 className="text-lg font-semibold text-foreground mb-4">Data Import</h3>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Upload Data File (CSV or JSON)
            </label>
            <input
              type="file"
              accept=".csv,.json"
              onChange={handleFileUpload}
              className="w-full p-2 border border-secondary/30 rounded-lg bg-background text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-accent file:text-white hover:file:bg-accent/90 transition-colors"
            />
          </div>
          <div className="text-center">
            <span className="text-muted-foreground text-sm">or</span>
          </div>
          <button
            onClick={generateSampleData}
            className="px-6 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg transition-colors"
          >
            Use Sample Data
          </button>
        </div>

        {isLoading && (
          <div className="mt-4 text-center text-accent">Loading...</div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            {error}
          </div>
        )}

        {fileName && !error && (
          <div className="mt-4 text-sm text-green-600">
            ✓ Loaded: {fileName} ({data.length} rows, {columns.length} columns)
          </div>
        )}
      </div>

      {/* Chart Configuration */}
      {data.length > 0 && (
        <div className="bg-secondary/20 rounded-lg p-6 border border-secondary/30">
          <h3 className="text-lg font-semibold text-foreground mb-4">Chart Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Chart Type</label>
              <select
                value={chartConfig.type}
                onChange={(e) => setChartConfig(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full p-2 border border-secondary/30 rounded-lg bg-background text-foreground"
              >
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="pie">Pie Chart</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">X-Axis</label>
              <select
                value={chartConfig.xAxis}
                onChange={(e) => setChartConfig(prev => ({ ...prev, xAxis: e.target.value }))}
                className="w-full p-2 border border-secondary/30 rounded-lg bg-background text-foreground"
              >
                <option value="">Select column...</option>
                {columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Y-Axis</label>
              <select
                value={chartConfig.yAxis}
                onChange={(e) => setChartConfig(prev => ({ ...prev, yAxis: e.target.value }))}
                className="w-full p-2 border border-secondary/30 rounded-lg bg-background text-foreground"
              >
                <option value="">Select column...</option>
                {getNumericColumns().map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Chart Title</label>
              <input
                type="text"
                value={chartConfig.title}
                onChange={(e) => setChartConfig(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-2 border border-secondary/30 rounded-lg bg-background text-foreground"
                placeholder="Enter chart title..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Chart Display */}
      {data.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Visualization</h3>
          {renderChart()}
        </div>
      )}

      {/* Data Preview */}
      {data.length > 0 && (
        <div className="bg-secondary/20 rounded-lg p-6 border border-secondary/30">
          <h3 className="text-lg font-semibold text-foreground mb-4">Data Preview</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-secondary/30">
                  {columns.map(col => (
                    <th key={col} className="text-left p-2 text-foreground font-medium">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 10).map((row, index) => (
                  <tr key={index} className="border-b border-secondary/20">
                    {columns.map(col => (
                      <td key={col} className="p-2 text-muted-foreground">
                        {String(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length > 10 && (
              <p className="text-sm text-muted-foreground mt-2">
                Showing first 10 rows of {data.length} total rows
              </p>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-center text-sm text-muted-foreground space-y-2">
        <p><strong>Supported formats:</strong> CSV files with headers, JSON arrays of objects</p>
        <p><strong>Example CSV:</strong> name,value,category</p>
        <p><strong>Example JSON:</strong> {`[{"name": "Item 1", "value": 100, "category": "A"}]`}</p>
      </div>
    </div>
  )
}