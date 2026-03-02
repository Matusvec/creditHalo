import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { useStore } from '../store/useStore';
import { getAccountAnalysis, openPlaidLink } from '../services/plaid';
import { globalStyles, colors } from '../theme/styles';

export default function InsightsScreen() {
  const { bankLinked, setBankLinked, addAlert, alerts, removeAlert, persist } = useStore();
  const [analysisVisible, setAnalysisVisible] = useState(false);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [loanModalVisible, setLoanModalVisible] = useState(false);
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [alertModalVisible, setAlertModalVisible] = useState(false);

  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTerm, setLoanTerm] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState(null);
  const [totalInterest, setTotalInterest] = useState(null);

  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState([{ id: '1', name: '', amount: '' }]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [difference, setDifference] = useState(null);

  const [alertName, setAlertName] = useState('');
  const [alertTime, setAlertTime] = useState('09:00');
  const [alertDay, setAlertDay] = useState('');
  const [alertFreq, setAlertFreq] = useState('monthly');

  const handleRequestAnalysis = async () => {
    setAnalysisLoading(true);
    setAnalysisVisible(true);
    const results = await getAccountAnalysis();
    setAnalysisResults(results);
    setAnalysisLoading(false);
  };

  const handleLoanCalculate = () => {
    const P = parseFloat(loanAmount) || 0;
    const r = (parseFloat(interestRate) || 0) / 100 / 12;
    const n = (parseFloat(loanTerm) || 0) * 12;
    if (P > 0 && n > 0) {
      const M = r > 0 ? (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : P / n;
      const total = M * n;
      setMonthlyPayment(M.toFixed(2));
      setTotalInterest((total - P).toFixed(2));
    }
  };

  const handleBudgetCalculate = () => {
    const inc = parseFloat(income) || 0;
    const expTotal = expenses.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);
    setTotalExpenses(expTotal);
    setDifference((inc - expTotal).toFixed(2));
  };

  const addExpenseRow = () => {
    setExpenses((prev) => [...prev, { id: Date.now().toString(), name: '', amount: '' }]);
  };

  const updateExpense = (id, field, value) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const handleAddAlert = () => {
    if (alertName.trim()) {
      addAlert({
        name: alertName.trim(),
        time: alertTime,
        day: alertDay,
        frequency: alertFreq,
      });
      persist();
      setAlertName('');
      setAlertDay('');
      setAlertModalVisible(false);
    }
  };

  return (
    <ScrollView style={globalStyles.container}>
      <View style={globalStyles.card}>
        <Text style={globalStyles.subtitle}>
          Credit Halo will analyze your bank history to improve your financial habits.
        </Text>
      </View>

      <TouchableOpacity
        style={[globalStyles.button, { marginBottom: 16 }]}
        onPress={handleRequestAnalysis}
      >
        <Text style={globalStyles.buttonText}>Request Credit Halo analysis</Text>
      </TouchableOpacity>

      <Text style={[globalStyles.title, { marginBottom: 12 }]}>Quick Actions</Text>

      <TouchableOpacity
        style={globalStyles.card}
        onPress={async () => {
          await openPlaidLink(() => {
            setBankLinked(true);
            persist();
          }, () => {});
        }}
      >
        <Text style={[globalStyles.title, { fontSize: 18 }]}>Request bank account check</Text>
        <Text style={globalStyles.subtitle}>Link or verify your bank</Text>
      </TouchableOpacity>

      <TouchableOpacity style={globalStyles.card} onPress={() => setLoanModalVisible(true)}>
        <Text style={[globalStyles.title, { fontSize: 18 }]}>Loan calculator</Text>
        <Text style={globalStyles.subtitle}>Calculate monthly payments</Text>
      </TouchableOpacity>

      <TouchableOpacity style={globalStyles.card} onPress={() => setBudgetModalVisible(true)}>
        <Text style={[globalStyles.title, { fontSize: 18 }]}>Budgeting tool</Text>
        <Text style={globalStyles.subtitle}>Income vs expenses</Text>
      </TouchableOpacity>

      <TouchableOpacity style={globalStyles.card} onPress={() => setAlertModalVisible(true)}>
        <Text style={[globalStyles.title, { fontSize: 18 }]}>Set up alerts</Text>
        <Text style={globalStyles.subtitle}>Payment reminders, bills due</Text>
      </TouchableOpacity>

      {alerts.length > 0 && (
        <>
          <Text style={[globalStyles.title, { marginTop: 16, marginBottom: 12 }]}>Your Alerts</Text>
          {alerts.filter((a) => a && a.id).map((a) => (
            <View key={a.id} style={[globalStyles.card, { flexDirection: 'row', justifyContent: 'space-between' }]}>
              <View>
                <Text style={{ fontWeight: '600', color: colors.text }}>{a.name ?? ''}</Text>
                <Text style={globalStyles.subtitle}>{a.frequency} • {a.time}</Text>
              </View>
              <TouchableOpacity onPress={() => { removeAlert(a.id); persist(); }}>
                <Text style={{ color: colors.error }}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}

      <Modal visible={analysisVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}>
          <View style={[globalStyles.card, { backgroundColor: colors.white, maxHeight: '80%' }]}>
            <Text style={globalStyles.title}>Your Analysis</Text>
            {analysisLoading ? (
              <Text style={globalStyles.subtitle}>Analyzing...</Text>
            ) : (
              <ScrollView>
                {analysisResults.map((r, i) => (
                  <View key={i} style={{ padding: 8, marginBottom: 8, backgroundColor: colors.background, borderRadius: 8 }}>
                    <Text style={{ color: colors.text }}>• {r}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity style={[globalStyles.button, { marginTop: 16 }]} onPress={() => setAnalysisVisible(false)}>
              <Text style={globalStyles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={loanModalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}>
          <View style={[globalStyles.card, { backgroundColor: colors.white }]}>
            <Text style={globalStyles.title}>Loan Calculator</Text>
            <TextInput
              style={[globalStyles.input, { marginBottom: 12 }]}
              placeholder="Loan amount ($)"
              value={loanAmount}
              onChangeText={setLoanAmount}
              keyboardType="numeric"
            />
            <TextInput
              style={[globalStyles.input, { marginBottom: 12 }]}
              placeholder="Interest rate (%)"
              value={interestRate}
              onChangeText={setInterestRate}
              keyboardType="numeric"
            />
            <TextInput
              style={[globalStyles.input, { marginBottom: 12 }]}
              placeholder="Term (years)"
              value={loanTerm}
              onChangeText={setLoanTerm}
              keyboardType="numeric"
            />
            <TouchableOpacity style={[globalStyles.button, { marginBottom: 12 }]} onPress={handleLoanCalculate}>
              <Text style={globalStyles.buttonText}>Calculate</Text>
            </TouchableOpacity>
            {monthlyPayment !== null && (
              <View style={{ marginBottom: 12 }}>
                <Text style={globalStyles.subtitle}>Monthly payment: ${monthlyPayment}</Text>
                <Text style={globalStyles.subtitle}>Total interest: ${totalInterest}</Text>
              </View>
            )}
            <TouchableOpacity style={globalStyles.button} onPress={() => setLoanModalVisible(false)}>
              <Text style={globalStyles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={budgetModalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}>
          <ScrollView>
            <View style={[globalStyles.card, { backgroundColor: colors.white }]}>
              <Text style={globalStyles.title}>Budget Tool</Text>
              <TextInput
                style={[globalStyles.input, { marginBottom: 12 }]}
                placeholder="Monthly income ($)"
                value={income}
                onChangeText={setIncome}
                keyboardType="numeric"
              />
              <Text style={[globalStyles.title, { fontSize: 16, marginBottom: 8 }]}>Expenses</Text>
              {expenses.map((e) => (
                <View key={e.id} style={{ flexDirection: 'row', marginBottom: 8 }}>
                  <TextInput
                    style={[globalStyles.input, { flex: 1, marginRight: 8 }]}
                    placeholder="Name"
                    value={e.name}
                    onChangeText={(v) => updateExpense(e.id, 'name', v)}
                  />
                  <TextInput
                    style={[globalStyles.input, { width: 80 }]}
                    placeholder="Amount"
                    value={e.amount}
                    onChangeText={(v) => updateExpense(e.id, 'amount', v)}
                    keyboardType="numeric"
                  />
                </View>
              ))}
              <TouchableOpacity onPress={addExpenseRow} style={{ marginBottom: 12 }}>
                <Text style={{ color: colors.primary }}>
                  + Add expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={[globalStyles.button, { marginBottom: 12 }]} onPress={handleBudgetCalculate}>
                <Text style={globalStyles.buttonText}>Calculate</Text>
              </TouchableOpacity>
              {difference !== null && (
                <View style={{ marginBottom: 12 }}>
                  <Text style={globalStyles.subtitle}>Total expenses: ${totalExpenses}</Text>
                  <Text style={globalStyles.subtitle}>Income: ${income}</Text>
                  <Text style={[globalStyles.title, { fontSize: 18 }]}>Difference: ${difference}</Text>
                </View>
              )}
              <TouchableOpacity style={globalStyles.button} onPress={() => setBudgetModalVisible(false)}>
                <Text style={globalStyles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={alertModalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}>
          <View style={[globalStyles.card, { backgroundColor: colors.white }]}>
            <Text style={globalStyles.title}>Set Up Alert</Text>
            <TextInput
              style={[globalStyles.input, { marginBottom: 12 }]}
              placeholder="e.g. Credit card payment due"
              value={alertName}
              onChangeText={setAlertName}
            />
            <TextInput
              style={[globalStyles.input, { marginBottom: 12 }]}
              placeholder="Time (e.g. 09:00)"
              value={alertTime}
              onChangeText={setAlertTime}
            />
            <TextInput
              style={[globalStyles.input, { marginBottom: 12 }]}
              placeholder="Day (e.g. 15th)"
              value={alertDay}
              onChangeText={setAlertDay}
            />
            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
              {['daily', 'weekly', 'monthly'].map((f) => (
                <TouchableOpacity
                  key={f}
                  style={{
                    padding: 8,
                    marginRight: 8,
                    backgroundColor: alertFreq === f ? colors.primary : colors.background,
                    borderRadius: 8,
                  }}
                  onPress={() => setAlertFreq(f)}
                >
                  <Text style={globalStyles.buttonText}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={[globalStyles.button, { marginBottom: 12 }]} onPress={handleAddAlert}>
              <Text style={globalStyles.buttonText}>Add Alert</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAlertModalVisible(false)}>
              <Text style={globalStyles.subtitle}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
