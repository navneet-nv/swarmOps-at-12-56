import React, { useContext, useState, useEffect, useCallback } from 'react';
import { AppContext } from '../App';
import axios from 'axios';
import { CreditCard, Plus, DollarSign, AlertCircle, PieChart, TrendingUp, Wallet, ArrowRight, ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { motion } from 'framer-motion';

const BudgetAgent = () => {
  const { currentEventId, userId, API } = useContext(AppContext);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([{ name: 'Venue', allocated: 0 }]);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');

  const fetchBudgets = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/agent/budget/${currentEventId}`);
      setBudgets(response.data);
    } catch (e) {
      console.error('Failed to fetch budgets', e);
    }
  }, [API, currentEventId]);

  useEffect(() => {
    fetchBudgets();
  }, [currentEventId, fetchBudgets]);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="py-10 space-y-10 max-w-7xl mx-auto text-foreground" 
      data-testid="budget-agent-page"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-between bg-card/40 border border-border p-8 rounded-3xl premium-glass gap-6">
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 bg-accent-pink/10 rounded-2xl flex items-center justify-center border border-accent-pink/20 shadow-[0_0_20px_hsl(var(--accent-pink)/0.15)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-accent-pink/5 group-hover:bg-accent-pink/10 transition-colors" />
            <TrendingUp className="w-8 h-8 text-accent-pink group-hover:scale-110 transition-transform" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-heading font-black text-4xl md:text-5xl tracking-tight text-foreground" data-testid="page-title">
              Budget Agent
            </h1>
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mt-2 flex items-center gap-2" data-testid="page-subtitle">
              Resource Allocation <span className="text-accent-pink opacity-50">&bull;</span> Overrun Surveillance
            </p>
          </div>
        </div>
        
        <div className="px-6 py-2.5 rounded-full border border-accent-cyan/20 bg-accent-cyan/10 text-accent-cyan flex items-center space-x-3 shadow-[0_0_15px_hsl(var(--accent-cyan)/0.1)]">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-cyan animate-pulse shadow-[0_0_8px_hsl(var(--accent-cyan))]" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest">Reserve Protocol Active</span>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Allocation & Controls */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="premium-glass bg-card/30 border-border overflow-hidden group hover:border-border/80 transition-all">
            <CardHeader className="bg-secondary/30 border-b border-border py-5 flex flex-row items-center justify-between">
              <div className="flex items-center space-x-3">
                <PieChart className="w-4 h-4 text-accent-cyan" />
                <CardTitle className="font-heading text-sm uppercase tracking-widest text-foreground">Config Layer</CardTitle>
              </div>
              <Button
                onClick={addCategory}
                variant="outline"
                className="border-border text-foreground hover:bg-secondary/80 h-8 px-4 rounded-lg font-mono text-[9px] uppercase tracking-widest"
              >
                <Plus className="w-3 h-3 mr-1.5" />
                Add Vector
              </Button>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-3">
                {categories.map((category, index) => (
                  <div key={index} className="bg-secondary/30 border border-border/50 p-4 rounded-xl grid grid-cols-2 gap-4 group-hover:bg-secondary/50 transition-all">
                    <div className="space-y-2">
                      <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest ml-1">Label</label>
                      <Input
                        placeholder="e.g. Venue"
                        value={category.name}
                        onChange={(e) => updateCategory(index, 'name', e.target.value)}
                        className="bg-background/80 border-border/50 text-foreground h-11 rounded-lg text-sm focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest ml-1">Cap ($)</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={category.allocated}
                        onChange={(e) => updateCategory(index, 'allocated', e.target.value)}
                        className="bg-background/80 border-border/50 text-foreground h-11 rounded-lg text-sm focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/50"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <Button
                onClick={handleCreateBudget}
                className="w-full bg-accent-cyan text-accent-cyan-foreground font-subheading font-bold uppercase tracking-widest hover:bg-white h-14 rounded-xl shadow-[0_10px_30px_hsl(var(--accent-cyan)/0.15)] transition-all hover:scale-[1.02] active:scale-[0.98] text-neutral-950"
              >
                Initialize Reserve
              </Button>
            </CardContent>
          </Card>

          {/* Active Budgets List */}
          {budgets.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center space-x-2 ml-2">
                <Wallet className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold">Active Reserve Units</span>
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
                          ? 'premium-glass-hover bg-accent-cyan/5 border-accent-cyan/40 shadow-[0_0_20px_hsl(var(--accent-cyan)/0.1)]'
                          : overrun
                          ? 'bg-destructive/5 border-destructive/20 hover:border-destructive/40'
                          : 'bg-secondary/30 border-border hover:bg-secondary/50 hover:border-border/80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-6 relative z-10">
                        <div className="font-mono text-[10px] text-foreground font-bold opacity-60 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-purple opacity-50" />
                          ID://{budget.budget_id?.slice(-8).toUpperCase()}
                        </div>
                        {overrun && (
                          <div className="flex items-center space-x-2 text-destructive animate-pulse bg-destructive/10 px-2.5 py-1 rounded-md border border-destructive/20">
                            <ShieldAlert className="w-3 h-3" />
                            <span className="font-mono text-[9px] font-black uppercase tracking-widest">Overrun</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-6 relative z-10">
                        <div className="space-y-1.5">
                          <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">Allocated</p>
                          <p className="font-heading text-xl md:text-2xl text-foreground font-medium block">${budget.total_allocated.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1.5">
                          <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">Utilized</p>
                          <p className={`font-heading text-xl md:text-2xl font-medium block ${overrun ? 'text-destructive' : 'text-accent-cyan'}`}>${(budget.total_spent || 0).toLocaleString()}</p>
                        </div>
                        <div className="space-y-1.5">
                          <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">Delta</p>
                          <p className="font-heading text-xl md:text-2xl text-accent-green font-medium block">${(budget.total_allocated - (budget.total_spent || 0)).toLocaleString()}</p>
                        </div>
                      </div>
                      
                      {/* Micro Progress Bar */}
                      <div className="mt-6 h-1 w-full bg-background/50 rounded-full overflow-hidden relative z-10 border border-border/50">
                         <div 
                          className={`h-full transition-all duration-1000 ${overrun ? 'bg-destructive shadow-[0_0_10px_hsl(var(--destructive))]' : 'bg-gradient-to-r from-accent-cyan to-accent-purple shadow-[0_0_10px_hsl(var(--accent-cyan)/0.5)]'}`} 
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
          <Card className={`premium-glass bg-card/30 border-border h-full flex flex-col transition-all duration-700 hover:border-border/80 ${!selectedBudget ? 'opacity-40 grayscale' : ''}`}>
             <CardHeader className="bg-secondary/30 border-b border-border py-5">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-4 h-4 text-accent-pink" />
                <CardTitle className="font-heading text-sm uppercase tracking-widest text-foreground">Expense Entry Logic</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-10 flex-1 flex flex-col justify-center">
              {!selectedBudget ? (
                 <div className="flex flex-col items-center justify-center text-center opacity-40 space-y-8 min-h-[400px]">
                  <div className="w-24 h-24 rounded-full bg-secondary/50 border border-border flex items-center justify-center">
                    <PieChart className="w-10 h-10 text-muted-foreground" strokeWidth={1} />
                  </div>
                  <p className="font-heading text-sm text-muted-foreground uppercase tracking-[0.3em] max-w-xs leading-relaxed">Awaiting reserve unit selection for ledger access</p>
                </div>
              ) : (
                <div className="space-y-10 animate-in-fade">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest ml-1 text-gradient-cyan">Source Vector</label>
                      <Input
                        value={expenseCategory}
                        onChange={(e) => setExpenseCategory(e.target.value)}
                        placeholder="e.g. Venue"
                        className="bg-background/60 border-border/80 text-foreground h-16 rounded-xl focus:border-accent-cyan/50 text-base"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest ml-1 text-gradient-purple">Quantum Amount ($)</label>
                      <Input
                        type="number"
                        value={expenseAmount}
                        onChange={(e) => setExpenseAmount(e.target.value)}
                        placeholder="0.00"
                        className="bg-background/60 border-border/80 text-foreground h-16 rounded-xl focus:border-accent-purple/50 text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest ml-1">Operation Metadata</label>
                    <Input
                      value={expenseDescription}
                      onChange={(e) => setExpenseDescription(e.target.value)}
                      placeholder="Transaction details..."
                      className="bg-background/60 border-border/80 text-foreground h-16 rounded-xl focus:border-primary/50 text-base"
                    />
                  </div>

                  <Button
                    onClick={handleAddExpense}
                    className="w-full bg-gradient-to-r from-accent-cyan to-accent-purple text-white font-subheading font-bold uppercase tracking-[0.2em] hover:opacity-90 h-16 rounded-2xl text-lg shadow-[0_15px_30px_hsl(var(--accent-purple)/0.2)] group transition-all transform active:scale-[0.98] border border-white/10"
                  >
                    <DollarSign className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                    Authorize Transaction
                  </Button>
                  
                  <div className="pt-8 border-t border-border mt-auto">
                    <div className="flex items-center space-x-2 mb-4">
                      <ArrowRight className="w-3 h-3 text-accent-pink" />
                      <span className="font-mono text-[9px] uppercase tracking-widest text-accent-pink">Unit Constraints</span>
                    </div>
                    <p className="font-body text-xs text-muted-foreground leading-relaxed font-light">
                      Transactions are monitored by the Neural Integrity Grid. 
                      Unauthorized overruns will trigger immediate administrative overrides.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BudgetAgent;
