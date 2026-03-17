import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import colors from '../theme/colors';
import { PremiumTabBar } from '../components/ui';

// Root screens
import LoadingScreen from '../screens/LoadingScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LessonDetailScreen from '../screens/LessonDetailScreen';

// Main tabs
import DashboardScreen from '../screens/DashboardScreen';
import LearnScreen from '../screens/LearnScreen';
import CommunityScreen from '../screens/CommunityScreen';

// Money stack screens
import MoneyHubScreen from '../screens/money/MoneyHubScreen';
import SpendingScreen from '../screens/money/SpendingScreen';
import CategoryDetailModal from '../screens/money/CategoryDetailModal';
import BudgetScreen from '../screens/money/BudgetScreen';
import SubscriptionsScreen from '../screens/money/SubscriptionsScreen';
import AccountsScreen from '../screens/money/AccountsScreen';
import InvestmentsScreen from '../screens/money/InvestmentsScreen';
import BillCalendarScreen from '../screens/money/BillCalendarScreen';
import CreditScoreSimScreen from '../screens/money/CreditScoreSimScreen';
import DebtPayoffScreen from '../screens/money/DebtPayoffScreen';

// Goals stack screens
import GoalsScreen from '../screens/GoalsScreen';
import GoalDetailScreen from '../screens/goals/GoalDetailScreen';
import SavingsChallengesScreen from '../screens/goals/SavingsChallengesScreen';

// New standalone stack screens
import HealthScoreScreen from '../screens/HealthScoreScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import ChatbotScreen from '../screens/ChatbotScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const MoneyStackNav = createNativeStackNavigator();
const GoalsStackNav = createNativeStackNavigator();

const SUB_STACK_OPTIONS = {
  headerTransparent: true,
  headerBlurEffect: 'dark',
  headerTintColor: colors.text,
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.background },
  animation: 'slide_from_right',
};

/** Nested stack for the Money tab */
function MoneyStackNavigator() {
  return (
    <MoneyStackNav.Navigator screenOptions={SUB_STACK_OPTIONS}>
      <MoneyStackNav.Screen name="MoneyHub" component={MoneyHubScreen} options={{ headerShown: false }} />
      <MoneyStackNav.Screen name="Spending" component={SpendingScreen} options={{ title: 'Spending' }} />
      <MoneyStackNav.Screen name="CategoryDetail" component={CategoryDetailModal} options={{ title: 'Category' }} />
      <MoneyStackNav.Screen name="Budget" component={BudgetScreen} options={{ title: 'Budget' }} />
      <MoneyStackNav.Screen name="Subscriptions" component={SubscriptionsScreen} options={{ title: 'Subscriptions' }} />
      <MoneyStackNav.Screen name="Accounts" component={AccountsScreen} options={{ title: 'Accounts' }} />
      <MoneyStackNav.Screen name="Investments" component={InvestmentsScreen} options={{ title: 'Investments' }} />
      <MoneyStackNav.Screen name="BillCalendar" component={BillCalendarScreen} options={{ title: 'Bill Calendar' }} />
      <MoneyStackNav.Screen name="CreditScoreSim" component={CreditScoreSimScreen} options={{ title: 'Credit Score Simulator' }} />
      <MoneyStackNav.Screen name="DebtPayoff" component={DebtPayoffScreen} options={{ title: 'Debt Payoff Planner' }} />
    </MoneyStackNav.Navigator>
  );
}

/** Nested stack for the Goals tab */
function GoalsStackNavigator() {
  return (
    <GoalsStackNav.Navigator screenOptions={SUB_STACK_OPTIONS}>
      <GoalsStackNav.Screen name="GoalsHub" component={GoalsScreen} options={{ headerShown: false }} />
      <GoalsStackNav.Screen name="GoalDetail" component={GoalDetailScreen} options={{ title: 'Goal Details' }} />
      <GoalsStackNav.Screen name="SavingsChallenges" component={SavingsChallengesScreen} options={{ title: 'Savings Challenges' }} />
    </GoalsStackNav.Navigator>
  );
}

/** Bottom tab navigator with 5 tabs */
function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <PremiumTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { position: 'absolute' },
      }}
    >
      <Tab.Screen name="DashboardTab" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="MoneyTab" component={MoneyStackNavigator} options={{ title: 'Money' }} />
      <Tab.Screen name="LearnTab" component={LearnScreen} options={{ title: 'Learn' }} />
      <Tab.Screen name="CommunityTab" component={CommunityScreen} options={{ title: 'Community' }} />
      <Tab.Screen name="GoalsTab" component={GoalsStackNavigator} options={{ title: 'Goals' }} />
    </Tab.Navigator>
  );
}

/** Root stack navigator */
export default function AppNavigator({ initialRoute = 'Loading' }) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: 'bold' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="Loading"
          component={LoadingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LessonDetail"
          component={LessonDetailScreen}
          options={{
            title: 'Lesson',
            headerTransparent: true,
            headerBlurEffect: 'dark',
            headerTintColor: colors.text,
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
            headerTransparent: true,
            headerBlurEffect: 'dark',
            headerTintColor: colors.text,
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="HealthScore"
          component={HealthScoreScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Achievements"
          component={AchievementsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Chatbot"
          component={ChatbotScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
