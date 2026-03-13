import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import axios from 'axios';
import { CreditCard, Plus, DollarSign, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';

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
    <div className="p-8 space-y-8" data-testid="budget-agent-page">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <CreditCard className="w-8 h-8 text-[#D4A017]" strokeWidth={1.5} />
        <div>
          <h1 className="font-heading font-bold text-3xl tracking-wide text-white" data-testid="page-title">
            Budget Tracker Agent
          </h1>
          <p className="font-mono text-xs text-gray-500 uppercase tracking-widest" data-testid="page-subtitle">
            Financial Monitoring & Overrun Detection
          </p>
        </div>
      </div>

      {/* Create Budget */}
      <div className="bg-[#101010] border border-white/5 p-6 rounded-sm space-y-4" data-testid="create-budget-section">
        <div className="flex items-center justify-between">
          <label className="font-subheading font-bold text-xl uppercase tracking-wider text-[#D4A017]" data-testid="categories-label">
            Budget Categories
          </label>
          <Button
            onClick={addCategory}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/5 h-10 px-4"
            data-testid="add-category-button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>

        <div className="space-y-3">
          {categories.map((category, index) => (
            <div key={index} className="bg-[#121212] border border-white/10 p-4 rounded-sm grid grid-cols-2 gap-3" data-testid={`category-row-${index}`}>
              <Input
                placeholder="Category Name"
                value={category.name}
                onChange={(e) => updateCategory(index, 'name', e.target.value)}
                className="bg-black/50 border border-white/10 text-white h-10 font-mono text-sm"
                data-testid={`category-name-${index}`}
              />
              <Input
                placeholder="Allocated Amount ($)"
                type="number"
                value={category.allocated}
                onChange={(e) => updateCategory(index, 'allocated', e.target.value)}
                className="bg-black/50 border border-white/10 text-white h-10 font-mono text-sm"
                data-testid={`category-amount-${index}`}
              />
            </div>
          ))}
        </div>

        <Button
          onClick={handleCreateBudget}
          className="bg-[#D4A017] text-black font-subheading font-bold uppercase tracking-wider hover:bg-[#F0B020] h-12 px-8"
          data-testid="create-budget-button"
        >
          Create Budget
        </Button>
      </div>

      {/* Budget List */}
      {budgets.length > 0 && (
        <div className="bg-[#101010] border border-white/5 p-6 rounded-sm space-y-4" data-testid="budgets-section">
          <h2 className="font-subheading font-bold text-xl uppercase tracking-wider text-[#D4A017]" data-testid="budgets-title">
            Active Budgets
          </h2>
          <div className="space-y-3">
            {budgets.map((budget, index) => {
              const overrun = budget.total_spent > budget.total_allocated;
              return (
                <div
                  key={index}
                  onClick={() => setSelectedBudget(budget)}
                  className={`bg-[#121212] border p-4 rounded-sm cursor-pointer ${
                    selectedBudget?.budget_id === budget.budget_id
                      ? 'border-[#D4A017]'
                      : overrun
                      ? 'border-red-500/50'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                  data-testid={`budget-item-${index}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-sm text-white" data-testid={`budget-id-${index}`}>{budget.budget_id}</span>
                    {overrun && (
                      <div className="flex items-center space-x-2 text-red-400" data-testid={`budget-overrun-${index}`}>
                        <AlertCircle className="w-4 h-4" />
                        <span className="font-mono text-xs uppercase">Overrun</span>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="font-mono text-xs text-gray-500 uppercase mb-1">Allocated</p>
                      <p className="font-heading text-lg text-green-400" data-testid={`budget-allocated-${index}`}>
                        ${budget.total_allocated.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-xs text-gray-500 uppercase mb-1">Spent</p>
                      <p className={`font-heading text-lg ${overrun ? 'text-red-400' : 'text-white'}`} data-testid={`budget-spent-${index}`}>
                        ${(budget.total_spent || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-xs text-gray-500 uppercase mb-1">Remaining</p>
                      <p className="font-heading text-lg text-[#D4A017]" data-testid={`budget-remaining-${index}`}>
                        ${(budget.total_allocated - (budget.total_spent || 0)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Expense */}
      {selectedBudget && (
        <div className="bg-[#101010] border border-[#D4A017] p-6 rounded-sm space-y-4" data-testid="add-expense-section">
          <h2 className="font-subheading font-bold text-xl uppercase tracking-wider text-[#D4A017]" data-testid="add-expense-title">
            Add Expense
          </h2>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="font-mono text-xs text-gray-400 uppercase" data-testid="expense-category-label">Category</label>
              <Input
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                placeholder="e.g., Venue"
                className="bg-black/50 border border-white/10 text-white h-10 font-mono text-sm"
                data-testid="expense-category-input"
              />
            </div>
            <div className="space-y-2">
              <label className="font-mono text-xs text-gray-400 uppercase" data-testid="expense-amount-label">Amount ($)</label>
              <Input
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                type="number"
                placeholder="0.00"
                className="bg-black/50 border border-white/10 text-white h-10 font-mono text-sm"
                data-testid="expense-amount-input"
              />
            </div>
            <div className="space-y-2">
              <label className="font-mono text-xs text-gray-400 uppercase" data-testid="expense-description-label">Description</label>
              <Input
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
                placeholder="Description"
                className="bg-black/50 border border-white/10 text-white h-10 font-mono text-sm"
                data-testid="expense-description-input"
              />
            </div>
          </div>

          <Button
            onClick={handleAddExpense}
            className="bg-[#D4A017] text-black font-subheading font-bold uppercase tracking-wider hover:bg-[#F0B020] h-12 px-8"
            data-testid="add-expense-button"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
      )}
    </div>
  );
};

export default BudgetAgent;
