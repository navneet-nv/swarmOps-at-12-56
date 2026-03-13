import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import axios from 'axios';
import { CreditCard, Plus, DollarSign, AlertCircle, PieChart, TrendingUp, Wallet, ArrowRight, ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';

const BudgetAgent = () => {
  const { currentEventId, userId, API } = useContext(AppContext);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([{ name: 'Venue', allocated: 0 }]);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');

  useEffect(() => {
    fetchBudgets();
  }, [currentEventId]);

  const fetchBudgets = async () => {
    try {
      const response = await axios.get(`${API}/agent/budget/${currentEventId}`);
      setBudgets(response.data);
    } catch (e) {
      console.error('Failed to fetch budgets', e);
    }
  };

  const addCategory = () => {
    setCategories([...categories, { name: '', allocated: 0 }]);
  };

  const updateCategory = (index, field, value) => {
    const updated = [...categories];
    updated[index][field] = field === 'allocated' ? parseFloat(value) || 0 : value;
    setCategories(updated);
  };

  const handleCreateBudget = async () => {
    const validCategories = categories.filter(c => c.name && c.allocated > 0);
    if (validCategories.length === 0) {
      toast.error('Please add at least one category');
      return;
    }

    try {
      await axios.post(`${API}/agent/budget/create`, {
        event_id: currentEventId,
        categories: validCategories,
        user_id: userId
      });
      toast.success('Budget created successfully!');
      fetchBudgets();
    } catch (e) {
      toast.error('Failed to create budget: ' + (e.response?.data?.detail || e.message));
    }
  };

  const handleAddExpense = async () => {
    if (!selectedBudget || !expenseCategory || !expenseAmount) {
      toast.error('Please fill all expense fields');
      return;
    }

    try {
      const response = await axios.post(`${API}/agent/budget/expense`, {
        budget_id: selectedBudget.budget_id,
        category: expenseCategory,
        amount: parseFloat(expenseAmount),
        description: expenseDescription
      });
      
      if (response.data.data.overrun) {
        toast.error('Budget overrun detected!');
      } else {
        toast.success('Expense added');
      }
      
      setExpenseCategory('');
      setExpenseAmount('');
      setExpenseDescription('');
      fetchBudgets();
    } catch (e) {
      toast.error('Failed to add expense: ' + (e.response?.data?.detail || e.message));
    }
  };

  return (
    <div className="py-10 space-y-10 max-w-7xl mx-auto text-white" data-testid="budget-agent-page">
      {/* Page Header */}
      <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-8 rounded-3xl premium-glass">
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 bg-[#D4A017]/10 rounded-2xl flex items-center justify-center border border-[#D4A017]/20 shadow-[0_0_20px_rgba(212,160,23,0.1)]">
            <TrendingUp className="w-8 h-8 text-[#D4A017]" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-heading font-bold text-4xl tracking-tight text-white" data-testid="page-title">
              Financial Oracle
            </h1>
            <p className="font-mono text-xs text-gray-500 uppercase tracking-[0.3em] mt-1" data-testid="page-subtitle">
              Resource Allocation & Overrun Surveillance
            </p>
          </div>
        </div>
        
        <div className="px-6 py-2 rounded-full border border-green-500/20 bg-green-500/10 text-green-500 flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Reserve Protocol Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Allocation & Controls */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="premium-glass bg-transparent border-white/5 overflow-hidden">
            <CardHeader className="bg-white/[0.03] border-b border-white/5 py-4 flex flex-row items-center justify-between">
              <div className="flex items-center space-x-2">
                <PieChart className="w-4 h-4 text-[#D4A017]" />
                <CardTitle className="font-heading text-sm uppercase tracking-widest text-white">Config Layer</CardTitle>
              </div>
              <Button
                onClick={addCategory}
                variant="outline"
                className="border-white/10 text-white hover:bg-white/5 h-8 px-4 rounded-lg font-mono text-[9px] uppercase tracking-widest"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Vector
              </Button>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-3">
                {categories.map((category, index) => (
                  <div key={index} className="bg-white/[0.02] border border-white/5 p-4 rounded-xl grid grid-cols-2 gap-3 group transition-all hover:bg-white/[0.04]">
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-mono text-gray-600 uppercase tracking-widest ml-1">Label</label>
                      <Input
                        placeholder="e.g. Venue"
                        value={category.name}
                        onChange={(e) => updateCategory(index, 'name', e.target.value)}
                        className="bg-black/40 border-white/10 text-white h-10 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-mono text-gray-600 uppercase tracking-widest ml-1">Cap ($)</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={category.allocated}
                        onChange={(e) => updateCategory(index, 'allocated', e.target.value)}
                        className="bg-black/40 border-white/10 text-white h-10 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <Button
                onClick={handleCreateBudget}
                className="w-full bg-[#D4A017] text-black font-subheading font-bold uppercase tracking-widest hover:bg-[#F0B020] h-14 rounded-xl shadow-[0_10px_30px_rgba(212,160,23,0.1)] group transition-all"
              >
                Initialize Reserve
              </Button>
            </CardContent>
          </Card>

          {/* Active Budgets List */}
          {budgets.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 ml-2">
                <Wallet className="w-4 h-4 text-gray-500" />
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">Active Reserve Units</span>
              </div>
              <div className="space-y-3">
                {budgets.map((budget, index) => {
                  const overrun = budget.total_spent > budget.total_allocated;
                  const percent = Math.min((budget.total_spent / budget.total_allocated) * 100, 100);
                  
                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedBudget(budget)}
                      className={`group p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
                        selectedBudget?.budget_id === budget.budget_id
                          ? 'premium-glass-hover bg-[#D4A017]/5 border-[#D4A017]/30'
                          : overrun
                          ? 'bg-red-500/5 border-red-500/20'
                          : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-6 relative z-10">
                        <div className="font-mono text-[10px] text-white font-bold opacity-60">ID://{budget.budget_id?.slice(-8).toUpperCase()}</div>
                        {overrun && (
                          <div className="flex items-center space-x-2 text-red-400 animate-pulse">
                            <ShieldAlert className="w-3 h-3" />
                            <span className="font-mono text-[9px] font-black uppercase tracking-widest">Overrun Alert</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-6 relative z-10">
                        <div className="space-y-1">
                          <p className="font-mono text-[9px] text-gray-600 uppercase tracking-tighter">Allocated</p>
                          <p className="font-heading text-xl text-white block">${budget.total_allocated.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="font-mono text-[9px] text-gray-600 uppercase tracking-tighter">Utilized</p>
                          <p className={`font-heading text-xl block ${overrun ? 'text-red-400' : 'text-[#D4A017]'}`}>${(budget.total_spent || 0).toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="font-mono text-[9px] text-gray-600 uppercase tracking-tighter">Delta</p>
                          <p className="font-heading text-xl text-green-400 block">${(budget.total_allocated - (budget.total_spent || 0)).toLocaleString()}</p>
                        </div>
                      </div>
                      
                      {/* Micro Progress Bar */}
                      <div className="mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden relative z-10">
                         <div 
                          className={`h-full transition-all duration-1000 ${overrun ? 'bg-red-500' : 'bg-[#D4A017]'}`} 
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Expense Ledger */}
        <div className="lg:col-span-7">
          <Card className={`premium-glass bg-transparent border-white/5 h-full flex flex-col transition-all duration-700 ${!selectedBudget ? 'opacity-30 grayscale' : ''}`}>
             <CardHeader className="bg-white/[0.03] border-b border-white/5 py-4">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-4 h-4 text-[#D4A017]" />
                <CardTitle className="font-heading text-sm uppercase tracking-widest text-white">Expense Entry Logic</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              {!selectedBudget ? (
                 <div className="h-96 flex flex-col items-center justify-center text-center opacity-30">
                  <PieChart className="w-20 h-20 text-gray-600 mb-6" strokeWidth={1} />
                  <p className="font-heading text-sm text-gray-400 uppercase tracking-[0.3em] max-w-xs">Awaiting reserve unit selection for ledger access</p>
                </div>
              ) : (
                <div className="space-y-10 animate-in-fade">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest ml-1 text-gradient-gold">Source Vector</label>
                      <Input
                        value={expenseCategory}
                        onChange={(e) => setExpenseCategory(e.target.value)}
                        placeholder="e.g. Venue"
                        className="bg-black/40 border-white/10 text-white h-14 rounded-xl focus:border-[#D4A017]/50 text-base"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest ml-1 text-gradient-gold">Quantum Amount ($)</label>
                      <Input
                        type="number"
                        value={expenseAmount}
                        onChange={(e) => setExpenseAmount(e.target.value)}
                        placeholder="0.00"
                        className="bg-black/40 border-white/10 text-white h-14 rounded-xl focus:border-[#D4A017]/50 text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest ml-1">Operation Metadata</label>
                    <Input
                      value={expenseDescription}
                      onChange={(e) => setExpenseDescription(e.target.value)}
                      placeholder="Transaction details..."
                      className="bg-black/40 border-white/10 text-white h-14 rounded-xl focus:border-[#D4A017]/50 text-base"
                    />
                  </div>

                  <Button
                    onClick={handleAddExpense}
                    className="w-full bg-[#D4A017] text-black font-subheading font-bold uppercase tracking-[0.2em] hover:bg-[#F0B020] h-20 rounded-2xl text-xl shadow-[0_20px_50px_rgba(212,160,23,0.15)] group transition-all transform active:scale-[0.98]"
                  >
                    <DollarSign className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                    Authorize Transaction
                  </Button>
                  
                  <div className="pt-8 border-t border-white/5">
                    <div className="flex items-center space-x-2 mb-4">
                      <ArrowRight className="w-3 h-3 text-[var(--accent-cyan)]" />
                      <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--accent-cyan)]">Unit Constraints</span>
                    </div>
                    <p className="font-body text-xs text-gray-500 leading-relaxed italic">
                      Transactions are monitored by the Neural Integrity Grid. 
                      Unauthorized overruns will trigger immediate administrative overrides.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BudgetAgent;
