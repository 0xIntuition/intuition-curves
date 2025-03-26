import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
// import './styles/globals.css'

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 700 },
  { name: 'Jun', value: 900 },
]

const App: React.FC = () => {
  return (
    <div className="app p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Intuition Curves</h1>
      </header>
      <main>
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default App
