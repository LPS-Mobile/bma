//+------------------------------------------------------------------+
//|                                         DailyBreadAutomation.mq5 |
//|                        Copyright 2025, MetaQuotes Software Corp. |
//|                                             https://www.mql5.com |
//+------------------------------------------------------------------+
#property copyright "Copyright 2025, MetaQuotes Software Corp."
#property link      "https://www.mql5.com"
#property version   "1.05"
#property description "DailyBreadAutomation "

#include <Trade\Trade.mqh>
#include <Trade\OrderInfo.mqh>
#include <Trade\PositionInfo.mqh>

//--- Input parameters
input group "EMA Display Settings"
input bool ShowEMAs = true;                             // Show EMAs on Chart
input color EMA50_Color = clrRed;                       // EMA 50 Color
input color EMA200_Color = clrBlue;                     // EMA 200 Color
input color EMA800_Color = clrGreen;                    // EMA 800 Color
input int EMA50_Width = 2;                              // EMA 50 Line Width
input int EMA200_Width = 2;                             // EMA 200 Line Width
input int EMA800_Width = 1;                             // EMA 800 Line Width
input ENUM_LINE_STYLE EMA50_Style = STYLE_SOLID;        // EMA 50 Line Style
input ENUM_LINE_STYLE EMA200_Style = STYLE_SOLID;       // EMA 200 Line Style
input ENUM_LINE_STYLE EMA800_Style = STYLE_SOLID;       // EMA 800 Line Style
input bool ShowLabels = true;                           // Show EMA Labels
input color LabelColor = clrWhite;                      // Label Text Color
input int LabelFontSize = 8;                            // Label Font Size

input group "EMA Periods"
input int EMA9_Period = 9;                              // EMA 9 Period
input int EMA21_Period = 21;                            // EMA 21 Period
input int EMA50_Period = 50;                            // EMA 50 Period
input int EMA200_Period = 200;                          // EMA 200 Period
input int EMA800_Period = 800;                          // EMA 800 Period

input group "EMA Separation Filter"
input bool UseEMASeparation = true;                     // Use EMA Separation Filter
input double MinSeparation50_200_Percent = 0.5;         // Min EMA50-200 separation (% of price)
input double MinSeparation200_800_Percent = 1.0;        // Min EMA200-800 separation (% of price)
input bool ShowSeparationInfo = true;                   // Show Separation info on chart

input group "ATR-Scaled Gap Entry Conditions"
input bool UseATRScaledGaps = false;                    // Use ATR-Scaled Gap Entry
input double K1_Multiplier = 1.0;                      // K1: (EMA50-EMA200) > K1*ATR multiplier
input double K2_Multiplier = 2.0;                      // K2: (EMA200-EMA800) > K2*ATR multiplier
input bool RequireBothGaps = true;                      // Require both gap conditions
input bool ShowGapInfo = false;                         // Show Gap info on chart
input int ATRPeriod = 14;                               // ATR Period for gap calculation

input group "Risk Management"
input bool UseATRForStopLoss = true;                    // Use ATR for Stop Loss
input double ATRMultiplier = 2.0;                       // ATR Multiplier for Stop Loss

input group "Trade Management"
input bool TrailToBreakeven = true;                     // Trail to Breakeven
input bool TrailWith1R = false;                         // Trail with 1R Profit
input double RiskRewardRatio = 2.0;                     // Risk:Reward Ratio

input group "Entry Conditions"
input bool RequireBullishBearishCandle = true;          // Require Bullish/Bearish Candle
input bool Use9_21CrossEntry = false;                   // Use 9/21 EMA Crossover (vs Position)

input group "General Settings"
input double LotSize = 0.1;                             // Lot Size
input int MagicNumber = 12345;                          // Magic Number
input int Slippage = 3;                                 // Slippage (Points)

input group "UI Settings"
input bool ShowControlPanel = true;                     // Show Control Panel
input bool ShowPnLMonitor = true;                       // Show PnL Monitor
input int UI_X_Distance = 20;                           // UI X Position
input int UI_Y_Distance = 80;                           // UI Y Position

input group "PnL Monitor Settings"
input bool EnablePnLLimits = true;                      // Enable PnL Limits
input double DailyLossLimit = 500.0;                    // Daily Loss Limit
input double DailyProfitTarget = 1000.0;                // Daily Profit Target
input double WeeklyLossLimit = 2000.0;                  // Weekly Loss Limit
input double MonthlyLossLimit = 5000.0;                 // Monthly Loss Limit
input int MaxDailyTrades = 10;                          // Max Daily Trades

//--- Global variables
CTrade trade;
CPositionInfo position;
COrderInfo order;

int ema9_handle, ema21_handle, ema50_handle, ema200_handle, ema800_handle, atr_handle;
double ema9[], ema21[], ema50[], ema200[], ema800[], atr[];

bool longTrendActive = false;
bool shortTrendActive = false;
bool tradeManaged = false;
double entryPrice = 0;
double initialStopLoss = 0;
double profitTarget = 0;
double riskAmount = 0;
ulong buyTicket = 0, sellTicket = 0;

// ATR-Scaled Gap entry conditions
bool gapConditionMet = false;
double ema50_200Gap = 0;
double ema200_800Gap = 0;
double requiredGap1 = 0;  // K1 * ATR
double requiredGap2 = 0;  // K2 * ATR

// EMA Separation filter
bool separationConditionMet = false;
double separation50_200 = 0;
double separation200_800 = 0;
double requiredSeparation50_200 = 0;
double requiredSeparation200_800 = 0;

// Strategy mode variables
enum STRATEGY_MODE
{
    CONSERVATIVE,
    MODERATE,
    AGGRESSIVE
};

STRATEGY_MODE currentMode = MODERATE;
bool longTradesEnabled = true;
bool shortTradesEnabled = true;
bool autoTradingEnabled = true;

// PnL Monitor variables
double dailyPnL = 0.0;
double weeklyPnL = 0.0;
double monthlyPnL = 0.0;
int dailyTrades = 0;
int winningTrades = 0;
int losingTrades = 0;
double largestWin = 0.0;
double largestLoss = 0.0;
datetime lastResetDate = 0;
datetime weekStartDate = 0;
datetime monthStartDate = 0;
bool stopTradingToday = false;
double sessionStartBalance = 0.0;

// Chart object names
string ema50_name = "EMA50_Line";
string ema200_name = "EMA200_Line";
string ema800_name = "EMA800_Line";
string ema50_label = "EMA50_Label";
string ema200_label = "EMA200_Label";
string ema800_label = "EMA800_Label";
string gapInfoLabel = "GapInfo_Label";
string separationInfoLabel = "SeparationInfo_Label";

// UI Control Panel
string panelName = "ControlPanel";
string pnlPanelName = "PnLPanel";
string longButtonName = "LongButton";
string shortButtonName = "ShortButton";
string closeAllButtonName = "CloseAllButton";
string conservativeButtonName = "ConservativeButton";
string moderateButtonName = "ModerateButton";
string aggressiveButtonName = "AggressiveButton";
string autoButtonName = "AutoButton";

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
    trade.SetExpertMagicNumber(MagicNumber);
    trade.SetDeviationInPoints(Slippage);
    trade.SetTypeFilling(ORDER_FILLING_IOC);
    
    ema9_handle = iMA(_Symbol, PERIOD_CURRENT, EMA9_Period, 0, MODE_EMA, PRICE_CLOSE);
    ema21_handle = iMA(_Symbol, PERIOD_CURRENT, EMA21_Period, 0, MODE_EMA, PRICE_CLOSE);
    ema50_handle = iMA(_Symbol, PERIOD_CURRENT, EMA50_Period, 0, MODE_EMA, PRICE_CLOSE);
    ema200_handle = iMA(_Symbol, PERIOD_CURRENT, EMA200_Period, 0, MODE_EMA, PRICE_CLOSE);
    ema800_handle = iMA(_Symbol, PERIOD_CURRENT, EMA800_Period, 0, MODE_EMA, PRICE_CLOSE);
    atr_handle = iATR(_Symbol, PERIOD_CURRENT, ATRPeriod);
    
    if(ema9_handle == INVALID_HANDLE || ema21_handle == INVALID_HANDLE ||
       ema50_handle == INVALID_HANDLE || ema200_handle == INVALID_HANDLE || 
       ema800_handle == INVALID_HANDLE || atr_handle == INVALID_HANDLE)
    {
        Print("Error creating indicators");
        return INIT_FAILED;
    }
    
    ArraySetAsSeries(ema9, true);
    ArraySetAsSeries(ema21, true);
    ArraySetAsSeries(ema50, true);
    ArraySetAsSeries(ema200, true);
    ArraySetAsSeries(ema800, true);
    ArraySetAsSeries(atr, true);
    
    if(ShowEMAs) CreateEMALines();
    InitializePnLTracking();
    if(ShowControlPanel) CreateControlPanel();
    if(ShowPnLMonitor) CreatePnLPanel();
    
    Print("Enhanced TripleStackTrendBot EA with 9/21 EMA Cross initialized successfully");
    return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
    if(ema9_handle != INVALID_HANDLE) IndicatorRelease(ema9_handle);
    if(ema21_handle != INVALID_HANDLE) IndicatorRelease(ema21_handle);
    if(ema50_handle != INVALID_HANDLE) IndicatorRelease(ema50_handle);
    if(ema200_handle != INVALID_HANDLE) IndicatorRelease(ema200_handle);
    if(ema800_handle != INVALID_HANDLE) IndicatorRelease(ema800_handle);
    if(atr_handle != INVALID_HANDLE) IndicatorRelease(atr_handle);
    
    RemoveEMALines();
    RemoveControlPanel();
    RemovePnLPanel();
    ObjectDelete(0, gapInfoLabel);
    ObjectDelete(0, separationInfoLabel);
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
{
    if(Bars(_Symbol, PERIOD_CURRENT) < EMA800_Period + 10)
        return;
        
    if(!UpdateIndicators()) return;
        
    if(ShowEMAs) UpdateEMALines();
    UpdatePnLTracking();
    if(ShowPnLMonitor) UpdatePnLDisplay();
        
    CheckTrendConditions();
    
    if(UseEMASeparation)
    {
        CalculateEMASeparation();
        if(ShowSeparationInfo) UpdateSeparationInfo();
    }
    
    if(UseATRScaledGaps)
    {
        CalculateATRScaledGaps();
        if(ShowGapInfo) UpdateGapInfo();
    }
    
    bool hasPosition = position.SelectByMagic(_Symbol, MagicNumber);
    
    if(!hasPosition)
    {
        ResetTradeVariables();
        if(autoTradingEnabled && !stopTradingToday && !ShouldStopTrading())
        {
            CheckForEntries();
        }
    }
    else
    {
        ManagePosition();
    }
}

//+------------------------------------------------------------------+
//| Calculate EMA Separation Conditions                              |
//+------------------------------------------------------------------+
void CalculateEMASeparation()
{
    if(ArraySize(ema50) < 1 || ArraySize(ema200) < 1 || ArraySize(ema800) < 1)
        return;
    
    double currentPrice = SymbolInfoDouble(_Symbol, SYMBOL_BID);
    
    // Calculate actual separations (absolute values)
    separation50_200 = MathAbs(ema50[0] - ema200[0]);
    separation200_800 = MathAbs(ema200[0] - ema800[0]);
    
    // Calculate required separations as percentage of current price
    requiredSeparation50_200 = currentPrice * (MinSeparation50_200_Percent / 100.0);
    requiredSeparation200_800 = currentPrice * (MinSeparation200_800_Percent / 100.0);
    
    // Check separation conditions
    bool sep1Met = (separation50_200 >= requiredSeparation50_200);
    bool sep2Met = (separation200_800 >= requiredSeparation200_800);
    
    // Both separations must be met to avoid consolidation
    separationConditionMet = sep1Met && sep2Met;
}

//+------------------------------------------------------------------+
//| Update Separation Info Display                                   |
//+------------------------------------------------------------------+
void UpdateSeparationInfo()
{
    ObjectDelete(0, separationInfoLabel);
    
    double currentPrice = SymbolInfoDouble(_Symbol, SYMBOL_BID);
    double sep50_200_percent = (separation50_200 / currentPrice) * 100.0;
    double sep200_800_percent = (separation200_800 / currentPrice) * 100.0;
    
    string info = StringFormat("EMA Separation: 50-200=%.1f%% (min:%.1f%%) | 200-800=%.1f%% (min:%.1f%%) | Status:%s",
                              sep50_200_percent, MinSeparation50_200_Percent,
                              sep200_800_percent, MinSeparation200_800_Percent,
                              separationConditionMet ? "CLEAR TREND" : "TOO CLOSE");
    
    ObjectCreate(0, separationInfoLabel, OBJ_LABEL, 0, 0, 0);
    ObjectSetInteger(0, separationInfoLabel, OBJPROP_CORNER, CORNER_LEFT_UPPER);
    ObjectSetInteger(0, separationInfoLabel, OBJPROP_XDISTANCE, 20);
    ObjectSetInteger(0, separationInfoLabel, OBJPROP_YDISTANCE, 20);
    ObjectSetString(0, separationInfoLabel, OBJPROP_TEXT, info);
    ObjectSetString(0, separationInfoLabel, OBJPROP_FONT, "Consolas");
    ObjectSetInteger(0, separationInfoLabel, OBJPROP_FONTSIZE, 8);
    
    color infoColor = clrWhite;
    if(separationConditionMet && longTrendActive) infoColor = clrLimeGreen;
    else if(separationConditionMet && shortTrendActive) infoColor = clrCoral;
    else if(separationConditionMet) infoColor = clrYellow;
    else infoColor = clrOrange;  // Too close - consolidation warning
    
    ObjectSetInteger(0, separationInfoLabel, OBJPROP_COLOR, infoColor);
    ChartRedraw();
}

//+------------------------------------------------------------------+
//| Calculate ATR-Scaled Gap Conditions                             |
//+------------------------------------------------------------------+
void CalculateATRScaledGaps()
{
    if(ArraySize(ema50) < 1 || ArraySize(ema200) < 1 || ArraySize(ema800) < 1 || ArraySize(atr) < 1)
        return;
    
    // Calculate current gaps (absolute values)
    ema50_200Gap = MathAbs(ema50[0] - ema200[0]);
    ema200_800Gap = MathAbs(ema200[0] - ema800[0]);
    
    // Calculate required ATR-scaled gaps
    requiredGap1 = K1_Multiplier * atr[0];  // (EMA50-EMA200) > K1*ATR
    requiredGap2 = K2_Multiplier * atr[0];  // (EMA200-EMA800) > K2*ATR
    
    // Check gap conditions
    bool gap1Met = (ema50_200Gap > requiredGap1);
    bool gap2Met = (ema200_800Gap > requiredGap2);
    
    if(RequireBothGaps)
    {
        gapConditionMet = gap1Met && gap2Met;
    }
    else
    {
        gapConditionMet = gap1Met || gap2Met;  // At least one gap condition met
    }
}

//+------------------------------------------------------------------+
//| Update Gap Info Display                                          |
//+------------------------------------------------------------------+
void UpdateGapInfo()
{
    ObjectDelete(0, gapInfoLabel);
    
    string info = StringFormat("Gaps: 50-200=%.5f (req:%.5f) | 200-800=%.5f (req:%.5f) | ATR=%.5f | Status:%s",
                              ema50_200Gap, requiredGap1, ema200_800Gap, requiredGap2, atr[0], 
                              gapConditionMet ? "MET" : "NOT MET");
    
    ObjectCreate(0, gapInfoLabel, OBJ_LABEL, 0, 0, 0);
    ObjectSetInteger(0, gapInfoLabel, OBJPROP_CORNER, CORNER_LEFT_UPPER);
    ObjectSetInteger(0, gapInfoLabel, OBJPROP_XDISTANCE, 20);
    ObjectSetInteger(0, gapInfoLabel, OBJPROP_YDISTANCE, 20);
    ObjectSetString(0, gapInfoLabel, OBJPROP_TEXT, info);
    ObjectSetString(0, gapInfoLabel, OBJPROP_FONT, "Consolas");
    ObjectSetInteger(0, gapInfoLabel, OBJPROP_FONTSIZE, 8);
    
    color infoColor = clrWhite;
    if(gapConditionMet && longTrendActive) infoColor = clrLimeGreen;
    else if(gapConditionMet && shortTrendActive) infoColor = clrCoral;
    else if(gapConditionMet) infoColor = clrYellow;
    
    ObjectSetInteger(0, gapInfoLabel, OBJPROP_COLOR, infoColor);
    ChartRedraw();
}

//+------------------------------------------------------------------+
//| Enhanced Check for Entry Signals                                |
//+------------------------------------------------------------------+
void CheckForEntries()
{
    MqlRates rates[];
    if(CopyRates(_Symbol, PERIOD_CURRENT, 0, 3, rates) < 3) return;
    ArraySetAsSeries(rates, true);
    
    double currentClose = rates[0].close;
    double currentOpen = rates[0].open;
    double currentHigh = rates[0].high;
    double currentLow = rates[0].low;
    
    // Determine 9/21 EMA condition based on input setting
    bool ema9_21LongCondition, ema9_21ShortCondition;
    
    if(Use9_21CrossEntry)
    {
        // Original: Check for crossover
        ema9_21LongCondition = (ema9[1] <= ema21[1] && ema9[0] > ema21[0]);  // Bullish cross
        ema9_21ShortCondition = (ema9[1] >= ema21[1] && ema9[0] < ema21[0]); // Bearish cross
    }
    else
    {
        // New: Simple position check - 9 above 21 for long, 9 below 21 for short
        ema9_21LongCondition = (ema9[0] > ema21[0]);   // 9 EMA above 21 EMA
        ema9_21ShortCondition = (ema9[0] < ema21[0]);  // 9 EMA below 21 EMA
    }
    
    // Additional condition: 9 and 21 must be above 50 for long, below 50 for short
    bool ema9_21_Above50 = (ema9[0] > ema50[0] && ema21[0] > ema50[0]);
    bool ema9_21_Below50 = (ema9[0] < ema50[0] && ema21[0] < ema50[0]);
    
    // Long entry conditions
    if(longTradesEnabled && longTrendActive && ema9_21LongCondition && ema9_21_Above50)
    {
        bool separationCondition = UseEMASeparation ? separationConditionMet : true;
        bool gapCondition = UseATRScaledGaps ? gapConditionMet : true;
        bool candleCondition = RequireBullishBearishCandle ? (currentClose > currentOpen) : true;
        
        if(separationCondition && gapCondition && candleCondition)
        {
            string entryType = Use9_21CrossEntry ? "EMA 9 crossed above EMA 21" : "EMA 9 above EMA 21";
            Print("Long entry triggered - ", entryType, ":");
            Print("  - EMA50 > EMA200 > EMA800: ", (ema50[0] > ema200[0] && ema200[0] > ema800[0]));
            Print("  - EMA9[0]=", DoubleToString(ema9[0], 5), " EMA21[0]=", DoubleToString(ema21[0], 5), " EMA50[0]=", DoubleToString(ema50[0], 5));
            Print("  - EMA9 & 21 above EMA50: ", ema9_21_Above50);
            if(Use9_21CrossEntry)
            {
                Print("  - EMA9[1]=", DoubleToString(ema9[1], 5), " EMA21[1]=", DoubleToString(ema21[1], 5));
            }
            
            if(UseEMASeparation)
            {
                double currentPrice = SymbolInfoDouble(_Symbol, SYMBOL_BID);
                Print("  - EMA Separation 50-200: ", DoubleToString((separation50_200/currentPrice)*100, 2), "% (min:", DoubleToString(MinSeparation50_200_Percent, 2), "%)");
                Print("  - EMA Separation 200-800: ", DoubleToString((separation200_800/currentPrice)*100, 2), "% (min:", DoubleToString(MinSeparation200_800_Percent, 2), "%)");
            }
            
            if(UseATRScaledGaps)
            {
                Print("  - EMA50-200 Gap: ", DoubleToString(ema50_200Gap, 5), " > Required: ", DoubleToString(requiredGap1, 5));
                Print("  - EMA200-800 Gap: ", DoubleToString(ema200_800Gap, 5), " > Required: ", DoubleToString(requiredGap2, 5));
                Print("  - ATR: ", DoubleToString(atr[0], 5));
            }
            
            OpenLongPosition();
        }
    }
    
    // Short entry conditions
    if(shortTradesEnabled && shortTrendActive && ema9_21ShortCondition && ema9_21_Below50)
    {
        bool separationCondition = UseEMASeparation ? separationConditionMet : true;
        bool gapCondition = UseATRScaledGaps ? gapConditionMet : true;
        bool candleCondition = RequireBullishBearishCandle ? (currentClose < currentOpen) : true;
        
        if(separationCondition && gapCondition && candleCondition)
        {
            string entryType = Use9_21CrossEntry ? "EMA 9 crossed below EMA 21" : "EMA 9 below EMA 21";
            Print("Short entry triggered - ", entryType, ":");
            Print("  - EMA800 > EMA200 > EMA50: ", (ema800[0] > ema200[0] && ema200[0] > ema50[0]));
            Print("  - EMA9[0]=", DoubleToString(ema9[0], 5), " EMA21[0]=", DoubleToString(ema21[0], 5), " EMA50[0]=", DoubleToString(ema50[0], 5));
            Print("  - EMA9 & 21 below EMA50: ", ema9_21_Below50);
            if(Use9_21CrossEntry)
            {
                Print("  - EMA9[1]=", DoubleToString(ema9[1], 5), " EMA21[1]=", DoubleToString(ema21[1], 5));
            }
            
            if(UseEMASeparation)
            {
                double currentPrice = SymbolInfoDouble(_Symbol, SYMBOL_BID);
                Print("  - EMA Separation 50-200: ", DoubleToString((separation50_200/currentPrice)*100, 2), "% (min:", DoubleToString(MinSeparation50_200_Percent, 2), "%)");
                Print("  - EMA Separation 200-800: ", DoubleToString((separation200_800/currentPrice)*100, 2), "% (min:", DoubleToString(MinSeparation200_800_Percent, 2), "%)");
            }
            
            if(UseATRScaledGaps)
            {
                Print("  - EMA50-200 Gap: ", DoubleToString(ema50_200Gap, 5), " > Required: ", DoubleToString(requiredGap1, 5));
                Print("  - EMA200-800 Gap: ", DoubleToString(ema200_800Gap, 5), " > Required: ", DoubleToString(requiredGap2, 5));
                Print("  - ATR: ", DoubleToString(atr[0], 5));
            }
            
            OpenShortPosition();
        }
    }
}

//+------------------------------------------------------------------+
//| Chart event function                                             |
//+------------------------------------------------------------------+
void OnChartEvent(const int id, const long &lparam, const double &dparam, const string &sparam)
{
    if(id == CHARTEVENT_OBJECT_CLICK)
    {
        if(sparam == longButtonName)
        {
            longTradesEnabled = !longTradesEnabled;
            UpdateControlPanel();
            Print("Long trades: ", longTradesEnabled ? "ENABLED" : "DISABLED");
        }
        else if(sparam == shortButtonName)
        {
            shortTradesEnabled = !shortTradesEnabled;
            UpdateControlPanel();
            Print("Short trades: ", shortTradesEnabled ? "ENABLED" : "DISABLED");
        }
        else if(sparam == closeAllButtonName)
        {
            CloseAllPositions();
        }
        else if(sparam == conservativeButtonName)
        {
            currentMode = CONSERVATIVE;
            UpdateControlPanel();
            Print("Strategy mode: CONSERVATIVE");
        }
        else if(sparam == moderateButtonName)
        {
            currentMode = MODERATE;
            UpdateControlPanel();
            Print("Strategy mode: MODERATE");
        }
        else if(sparam == aggressiveButtonName)
        {
            currentMode = AGGRESSIVE;
            UpdateControlPanel();
            Print("Strategy mode: AGGRESSIVE");
        }
        else if(sparam == autoButtonName)
        {
            autoTradingEnabled = !autoTradingEnabled;
            UpdateControlPanel();
            Print("Auto trading: ", autoTradingEnabled ? "ENABLED" : "DISABLED");
        }
    }
}

//+------------------------------------------------------------------+
//| Create Control Panel                                             |
//+------------------------------------------------------------------+
void CreateControlPanel()
{
    RemoveControlPanel();
    
    int panelWidth = 300;
    int panelHeight = 200;
    int buttonWidth = 90;
    int buttonHeight = 25;
    
    ObjectCreate(0, panelName, OBJ_RECTANGLE_LABEL, 0, 0, 0);
    ObjectSetInteger(0, panelName, OBJPROP_CORNER, CORNER_LEFT_UPPER);
    ObjectSetInteger(0, panelName, OBJPROP_XDISTANCE, UI_X_Distance);
    ObjectSetInteger(0, panelName, OBJPROP_YDISTANCE, UI_Y_Distance);
    ObjectSetInteger(0, panelName, OBJPROP_XSIZE, panelWidth);
    ObjectSetInteger(0, panelName, OBJPROP_YSIZE, panelHeight);
    ObjectSetInteger(0, panelName, OBJPROP_BGCOLOR, C'40,40,40');
    ObjectSetInteger(0, panelName, OBJPROP_BORDER_COLOR, clrWhite);
    ObjectSetInteger(0, panelName, OBJPROP_BORDER_TYPE, BORDER_FLAT);
    ObjectSetInteger(0, panelName, OBJPROP_WIDTH, 1);
    
    string titleName = panelName + "_Title";
    ObjectCreate(0, titleName, OBJ_LABEL, 0, 0, 0);
    ObjectSetInteger(0, titleName, OBJPROP_CORNER, CORNER_LEFT_UPPER);
    ObjectSetInteger(0, titleName, OBJPROP_XDISTANCE, UI_X_Distance + 10);
    ObjectSetInteger(0, titleName, OBJPROP_YDISTANCE, UI_Y_Distance + 10);
    ObjectSetString(0, titleName, OBJPROP_TEXT, "TripleStack 9/21 Cross Bot");
    ObjectSetString(0, titleName, OBJPROP_FONT, "Arial Bold");
    ObjectSetInteger(0, titleName, OBJPROP_FONTSIZE, 10);
    ObjectSetInteger(0, titleName, OBJPROP_COLOR, clrWhite);
    
    ObjectCreate(0, longButtonName, OBJ_BUTTON, 0, 0, 0);
    ObjectSetInteger(0, longButtonName, OBJPROP_CORNER, CORNER_LEFT_UPPER);
    ObjectSetInteger(0, longButtonName, OBJPROP_XDISTANCE, UI_X_Distance + 10);
    ObjectSetInteger(0, longButtonName, OBJPROP_YDISTANCE, UI_Y_Distance + 35);
    ObjectSetInteger(0, longButtonName, OBJPROP_XSIZE, buttonWidth);
    ObjectSetInteger(0, longButtonName, OBJPROP_YSIZE, buttonHeight);
    ObjectSetString(0, longButtonName, OBJPROP_TEXT, "Long ON");
    ObjectSetString(0, longButtonName, OBJPROP_FONT, "Arial");
    ObjectSetInteger(0, longButtonName, OBJPROP_FONTSIZE, 9);
    
    ObjectCreate(0, shortButtonName, OBJ_BUTTON, 0, 0, 0);
    ObjectSetInteger(0, shortButtonName, OBJPROP_CORNER, CORNER_LEFT_UPPER);
    ObjectSetInteger(0, shortButtonName, OBJPROP_XDISTANCE, UI_X_Distance + 110);
    ObjectSetInteger(0, shortButtonName, OBJPROP_YDISTANCE, UI_Y_Distance + 35);
    ObjectSetInteger(0, shortButtonName, OBJPROP_XSIZE, buttonWidth);
    ObjectSetInteger(0, shortButtonName, OBJPROP_YSIZE, buttonHeight);
    ObjectSetString(0, shortButtonName, OBJPROP_TEXT, "Short ON");
    ObjectSetString(0, shortButtonName, OBJPROP_FONT, "Arial");
    ObjectSetInteger(0, shortButtonName, OBJPROP_FONTSIZE, 9);
    
    ObjectCreate(0, closeAllButtonName, OBJ_BUTTON, 0, 0, 0);
    ObjectSetInteger(0, closeAllButtonName, OBJPROP_CORNER, CORNER_LEFT_UPPER);
    ObjectSetInteger(0, closeAllButtonName, OBJPROP_XDISTANCE, UI_X_Distance + 210);
    ObjectSetInteger(0, closeAllButtonName, OBJPROP_YDISTANCE, UI_Y_Distance + 35);
    ObjectSetInteger(0, closeAllButtonName, OBJPROP_XSIZE, buttonWidth - 10);
    ObjectSetInteger(0, closeAllButtonName, OBJPROP_YSIZE, buttonHeight);
    ObjectSetString(0, closeAllButtonName, OBJPROP_TEXT, "CLOSE ALL");
    ObjectSetString(0, closeAllButtonName, OBJPROP_FONT, "Arial");
    ObjectSetInteger(0, closeAllButtonName, OBJPROP_FONTSIZE, 9);
    ObjectSetInteger(0, closeAllButtonName, OBJPROP_BGCOLOR, clrCrimson);
    ObjectSetInteger(0, closeAllButtonName, OBJPROP_COLOR, clrWhite);
    
    ObjectCreate(0, conservativeButtonName, OBJ_BUTTON, 0, 0, 0);
    ObjectSetInteger(0, conservativeButtonName, OBJPROP_CORNER, CORNER_LEFT_UPPER);
    ObjectSetInteger(0, conservativeButtonName, OBJPROP_XDISTANCE, UI_X_Distance + 10);
    ObjectSetInteger(0, conservativeButtonName, OBJPROP_YDISTANCE, UI_Y_Distance + 70);
    ObjectSetInteger(0, conservativeButtonName, OBJPROP_XSIZE, buttonWidth);
    ObjectSetInteger(0, conservativeButtonName, OBJPROP_YSIZE, buttonHeight);
    ObjectSetString(0, conservativeButtonName, OBJPROP_TEXT, "Conservative");
    ObjectSetString(0, conservativeButtonName, OBJPROP_FONT, "Arial");
    ObjectSetInteger(0, conservativeButtonName, OBJPROP_FONTSIZE, 8);
    
    ObjectCreate(0, moderateButtonName, OBJ_BUTTON, 0, 0, 0);
    ObjectSetInteger(0, moderateButtonName, OBJPROP_CORNER, CORNER_LEFT_UPPER);
    ObjectSetInteger(0, moderateButtonName, OBJPROP_XDISTANCE, UI_X_Distance + 110);
    ObjectSetInteger(0, moderateButtonName, OBJPROP_YDISTANCE, UI_Y_Distance + 70);
    ObjectSetInteger(0, moderateButtonName, OBJPROP_XSIZE, buttonWidth);
    ObjectSetInteger(0, moderateButtonName, OBJPROP_YSIZE, buttonHeight);
    ObjectSetString(0, moderateButtonName, OBJPROP_TEXT, "Moderate");
    ObjectSetString(0, moderateButtonName, OBJPROP_FONT, "Arial");
    ObjectSetInteger(0, moderateButtonName, OBJPROP_FONTSIZE, 8);
    
    ObjectCreate(0, aggressiveButtonName, OBJ_BUTTON, 0, 0, 0);
    ObjectSetInteger(0, aggressiveButtonName, OBJPROP_CORNER, CORNER_LEFT_UPPER);
    ObjectSetInteger(0, aggressiveButtonName, OBJPROP_XDISTANCE, UI_X_Distance + 210);
    ObjectSetInteger(0, aggressiveButtonName, OBJPROP_YDISTANCE, UI_Y_Distance + 70);
    ObjectSetInteger(0, aggressiveButtonName, OBJPROP_XSIZE, buttonWidth - 10);
    ObjectSetInteger(0, aggressiveButtonName, OBJPROP_YSIZE, buttonHeight);
    ObjectSetString(0, aggressiveButtonName, OBJPROP_TEXT, "Aggressive");
    ObjectSetString(0, aggressiveButtonName, OBJPROP_FONT, "Arial");
    ObjectSetInteger(0, aggressiveButtonName, OBJPROP_FONTSIZE, 8);
    
    ObjectCreate(0, autoButtonName, OBJ_BUTTON, 0, 0, 0);
    ObjectSetInteger(0, autoButtonName, OBJPROP_CORNER, CORNER_LEFT_UPPER);
    ObjectSetInteger(0, autoButtonName, OBJPROP_XDISTANCE, UI_X_Distance + 10);
    ObjectSetInteger(0, autoButtonName, OBJPROP_YDISTANCE, UI_Y_Distance + 105);
    ObjectSetInteger(0, autoButtonName, OBJPROP_XSIZE, panelWidth - 20);
    ObjectSetInteger(0, autoButtonName, OBJPROP_YSIZE, buttonHeight + 5);
    ObjectSetString(0, autoButtonName, OBJPROP_TEXT, "AUTO TRADING: ON");
    ObjectSetString(0, autoButtonName, OBJPROP_FONT, "Arial Bold");
    ObjectSetInteger(0, autoButtonName, OBJPROP_FONTSIZE, 10);
    
    string statusName = panelName + "_Status";
    ObjectCreate(0, statusName, OBJ_LABEL, 0, 0, 0);
    ObjectSetInteger(0, statusName, OBJPROP_CORNER, CORNER_LEFT_UPPER);
    ObjectSetInteger(0, statusName, OBJPROP_XDISTANCE, UI_X_Distance + 10);
    ObjectSetInteger(0, statusName, OBJPROP_YDISTANCE, UI_Y_Distance + 140);
    ObjectSetString(0, statusName, OBJPROP_TEXT, "Status: Ready");
    ObjectSetString(0, statusName, OBJPROP_FONT, "Arial");
    ObjectSetInteger(0, statusName, OBJPROP_FONTSIZE, 8);
    ObjectSetInteger(0, statusName, OBJPROP_COLOR, clrLightGray);
    
    UpdateControlPanel();
    ChartRedraw();
}

//+------------------------------------------------------------------+
//| Update Control Panel                                             |
//+------------------------------------------------------------------+
void UpdateControlPanel()
{
    ObjectSetString(0, longButtonName, OBJPROP_TEXT, longTradesEnabled ? "Long ON" : "Long OFF");
    ObjectSetInteger(0, longButtonName, OBJPROP_BGCOLOR, longTradesEnabled ? clrGreen : clrGray);
    ObjectSetInteger(0, longButtonName, OBJPROP_COLOR, clrWhite);
    
    ObjectSetString(0, shortButtonName, OBJPROP_TEXT, shortTradesEnabled ? "Short ON" : "Short OFF");
    ObjectSetInteger(0, shortButtonName, OBJPROP_BGCOLOR, shortTradesEnabled ? clrRed : clrGray);
    ObjectSetInteger(0, shortButtonName, OBJPROP_COLOR, clrWhite);
    
    ObjectSetInteger(0, conservativeButtonName, OBJPROP_BGCOLOR, (currentMode == CONSERVATIVE) ? clrDodgerBlue : clrDarkGray);
    ObjectSetInteger(0, moderateButtonName, OBJPROP_BGCOLOR, (currentMode == MODERATE) ? clrDodgerBlue : clrDarkGray);
    ObjectSetInteger(0, aggressiveButtonName, OBJPROP_BGCOLOR, (currentMode == AGGRESSIVE) ? clrDodgerBlue : clrDarkGray);
    
    ObjectSetString(0, autoButtonName, OBJPROP_TEXT, autoTradingEnabled ? "AUTO TRADING: ON" : "AUTO TRADING: OFF");
    ObjectSetInteger(0, autoButtonName, OBJPROP_BGCOLOR, autoTradingEnabled ? clrGreen : clrRed);
    ObjectSetInteger(0, autoButtonName, OBJPROP_COLOR, clrWhite);
    
    string statusText = "Status: ";
    if(stopTradingToday) statusText += "TRADING STOPPED";
    else if(!autoTradingEnabled) statusText += "Manual Mode";
    else if(UseEMASeparation && separationConditionMet && longTrendActive) statusText += "Clear Long Trend";
    else if(UseEMASeparation && separationConditionMet && shortTrendActive) statusText += "Clear Short Trend";
    else if(UseEMASeparation && !separationConditionMet) statusText += "EMAs Too Close";
    else if(UseATRScaledGaps && gapConditionMet && longTrendActive) statusText += "ATR Gap Long Ready";
    else if(UseATRScaledGaps && gapConditionMet && shortTrendActive) statusText += "ATR Gap Short Ready";
    else if(longTrendActive) statusText += "Long Trend Active";
    else if(shortTrendActive) statusText += "Short Trend Active";
    else statusText += "Waiting for Signal";
    
    string statusName = panelName + "_Status";
    ObjectSetString(0, statusName, OBJPROP_TEXT, statusText);
    
    ChartRedraw();
}

//+------------------------------------------------------------------+
//| Remove Control Panel                                             |
//+------------------------------------------------------------------+
void RemoveControlPanel()
{
    ObjectDelete(0, panelName);
    ObjectDelete(0, panelName + "_Title");
    ObjectDelete(0, panelName + "_Status");
    ObjectDelete(0, longButtonName);
    ObjectDelete(0, shortButtonName);
    ObjectDelete(0, closeAllButtonName);
    ObjectDelete(0, conservativeButtonName);
    ObjectDelete(0, moderateButtonName);
    ObjectDelete(0, aggressiveButtonName);
    ObjectDelete(0, autoButtonName);
}

//+------------------------------------------------------------------+
//| Create PnL Panel                                                 |
//+------------------------------------------------------------------+
void CreatePnLPanel()
{
    RemovePnLPanel();
    
    int panelWidth = 300;
    int panelHeight = 220;
    int yOffset = ShowControlPanel ? 220 : 0;
    
    ObjectCreate(0, pnlPanelName, OBJ_RECTANGLE_LABEL, 0, 0, 0);
    ObjectSetInteger(0, pnlPanelName, OBJPROP_CORNER, CORNER_LEFT_UPPER);
    ObjectSetInteger(0, pnlPanelName, OBJPROP_XDISTANCE, UI_X_Distance);
    ObjectSetInteger(0, pnlPanelName, OBJPROP_YDISTANCE, UI_Y_Distance + yOffset);
    ObjectSetInteger(0, pnlPanelName, OBJPROP_XSIZE, panelWidth);
    ObjectSetInteger(0, pnlPanelName, OBJPROP_YSIZE, panelHeight);
    ObjectSetInteger(0, pnlPanelName, OBJPROP_BGCOLOR, C'30,30,30');
    ObjectSetInteger(0, pnlPanelName, OBJPROP_BORDER_COLOR, clrWhite);
    ObjectSetInteger(0, pnlPanelName, OBJPROP_BORDER_TYPE, BORDER_FLAT);
    ObjectSetInteger(0, pnlPanelName, OBJPROP_WIDTH, 1);
    
    string pnlTitleName = pnlPanelName + "_Title";
    ObjectCreate(0, pnlTitleName, OBJ_LABEL, 0, 0, 0);
    ObjectSetInteger(0, pnlTitleName, OBJPROP_CORNER, CORNER_LEFT_UPPER);
    ObjectSetInteger(0, pnlTitleName, OBJPROP_XDISTANCE, UI_X_Distance + 10);
    ObjectSetInteger(0, pnlTitleName, OBJPROP_YDISTANCE, UI_Y_Distance + yOffset + 10);
    ObjectSetString(0, pnlTitleName, OBJPROP_TEXT, "=== PnL MONITOR ===");
    ObjectSetString(0, pnlTitleName, OBJPROP_FONT, "Arial Bold");
    ObjectSetInteger(0, pnlTitleName, OBJPROP_FONTSIZE, 10);
    ObjectSetInteger(0, pnlTitleName, OBJPROP_COLOR, clrWhite);
    
    ChartRedraw();
}

//+------------------------------------------------------------------+
//| Update PnL Display                                               |
//+------------------------------------------------------------------+
void UpdatePnLDisplay()
{
    if(!ShowPnLMonitor) return;
    
    int yOffset = ShowControlPanel ? 220 : 0;
    int lineHeight = 15;
    int startY = UI_Y_Distance + yOffset + 35;
    
    for(int i = 0; i < 15; i++)
    {
        ObjectDelete(0, pnlPanelName + "_Line" + IntegerToString(i));
    }
    
    double winRate = (winningTrades + losingTrades > 0) ? 
        (double)winningTrades / (winningTrades + losingTrades) * 100.0 : 0.0;
    
    string lines[];
    ArrayResize(lines, 12);
    
    lines[0] = "Daily PnL: " + DoubleToString(dailyPnL, 2) + " (" + IntegerToString(dailyTrades) + " trades)";
    lines[1] = "Weekly PnL: " + DoubleToString(weeklyPnL, 2);
    lines[2] = "Monthly PnL: " + DoubleToString(monthlyPnL, 2);
    lines[3] = "Win Rate: " + DoubleToString(winRate, 1) + "% (" + IntegerToString(winningTrades) + "W/" + IntegerToString(losingTrades) + "L)";
    lines[4] = "Largest Win: " + DoubleToString(largestWin, 2);
    lines[5] = "Largest Loss: " + DoubleToString(largestLoss, 2);
    lines[6] = "";
    lines[7] = "=== LIMITS ===";
    lines[8] = "Daily Loss Limit: -" + DoubleToString(DailyLossLimit, 2);
    lines[9] = "Daily Profit Target: " + DoubleToString(DailyProfitTarget, 2);
    lines[10] = "Max Daily Trades: " + IntegerToString(dailyTrades) + "/" + IntegerToString(MaxDailyTrades);
    
    if(stopTradingToday)
        lines[11] = "*** TRADING STOPPED ***";
    else
        lines[11] = "Status: Active";
    
    for(int i = 0; i < ArraySize(lines); i++)
    {
        if(lines[i] == "") continue;
        
        string labelName = pnlPanelName + "_Line" + IntegerToString(i);
        ObjectCreate(0, labelName, OBJ_LABEL, 0, 0, 0);
        ObjectSetInteger(0, labelName, OBJPROP_CORNER, CORNER_LEFT_UPPER);
        ObjectSetInteger(0, labelName, OBJPROP_XDISTANCE, UI_X_Distance + 10);
        ObjectSetInteger(0, labelName, OBJPROP_YDISTANCE, startY + (i * lineHeight));
        ObjectSetString(0, labelName, OBJPROP_TEXT, lines[i]);
        ObjectSetString(0, labelName, OBJPROP_FONT, "Consolas");
        ObjectSetInteger(0, labelName, OBJPROP_FONTSIZE, 8);
        
        color textColor = clrWhite;
        if(StringFind(lines[i], "Daily PnL:") >= 0)
        {
            if(dailyPnL > 0) textColor = clrLimeGreen;
            else if(dailyPnL < 0) textColor = clrCoral;
        }
        else if(StringFind(lines[i], "TRADING STOPPED") >= 0)
        {
            textColor = clrRed;
        }
        else if(StringFind(lines[i], "===") >= 0)
        {
            textColor = clrYellow;
        }
        
        ObjectSetInteger(0, labelName, OBJPROP_COLOR, textColor);
    }
    
    ChartRedraw();
}

//+------------------------------------------------------------------+
//| Remove PnL Panel                                                 |
//+------------------------------------------------------------------+
void RemovePnLPanel()
{
    ObjectDelete(0, pnlPanelName);
    ObjectDelete(0, pnlPanelName + "_Title");
    
    for(int i = 0; i < 15; i++)
    {
        ObjectDelete(0, pnlPanelName + "_Line" + IntegerToString(i));
    }
}

//+------------------------------------------------------------------+
//| Initialize PnL Tracking                                          |
//+------------------------------------------------------------------+
void InitializePnLTracking()
{
    sessionStartBalance = AccountInfoDouble(ACCOUNT_BALANCE);
    lastResetDate = TimeCurrent();
    weekStartDate = GetWeekStart(TimeCurrent());
    monthStartDate = GetMonthStart(TimeCurrent());
    
    dailyPnL = 0.0;
    dailyTrades = 0;
    winningTrades = 0;
    losingTrades = 0;
    largestWin = 0.0;
    largestLoss = 0.0;
    stopTradingToday = false;
    
    Print("PnL tracking initialized");
}

//+------------------------------------------------------------------+
//| Update PnL Tracking                                              |
//+------------------------------------------------------------------+
void UpdatePnLTracking()
{
    datetime currentTime = TimeCurrent();
    datetime currentDate = GetDateOnly(currentTime);
    
    if(GetDateOnly(lastResetDate) != currentDate)
    {
        ResetDailyTracking();
        lastResetDate = currentTime;
    }
    
    if(currentTime >= weekStartDate + 7*24*3600)
    {
        weekStartDate = GetWeekStart(currentTime);
        weeklyPnL = 0.0;
        Print("Weekly PnL tracking reset");
    }
    
    if(GetMonthStart(currentTime) != monthStartDate)
    {
        monthStartDate = GetMonthStart(currentTime);
        monthlyPnL = 0.0;
        Print("Monthly PnL tracking reset");
    }
    
    CalculatePnLFromHistory();
}

//+------------------------------------------------------------------+
//| Calculate PnL from trade history                                 |
//+------------------------------------------------------------------+
void CalculatePnLFromHistory()
{
    datetime currentDate = GetDateOnly(TimeCurrent());
    datetime weekStart = weekStartDate;
    datetime monthStart = monthStartDate;
    
    dailyPnL = 0.0;
    weeklyPnL = 0.0;
    monthlyPnL = 0.0;
    dailyTrades = 0;
    winningTrades = 0;
    losingTrades = 0;
    largestWin = 0.0;
    largestLoss = 0.0;
    
    HistorySelect(monthStart, TimeCurrent() + 86400);
    
    for(int i = 0; i < HistoryDealsTotal(); i++)
    {
        ulong ticket = HistoryDealGetTicket(i);
        if(ticket == 0) continue;
        
        if(HistoryDealGetInteger(ticket, DEAL_MAGIC) != MagicNumber) continue;
        if(HistoryDealGetInteger(ticket, DEAL_ENTRY) != DEAL_ENTRY_OUT) continue;
        
        datetime dealTime = (datetime)HistoryDealGetInteger(ticket, DEAL_TIME);
        double profit = HistoryDealGetDouble(ticket, DEAL_PROFIT) + 
                       HistoryDealGetDouble(ticket, DEAL_SWAP) + 
                       HistoryDealGetDouble(ticket, DEAL_COMMISSION);
        
        if(GetDateOnly(dealTime) == currentDate)
        {
            dailyPnL += profit;
            dailyTrades++;
            
            if(profit > 0)
            {
                winningTrades++;
                if(profit > largestWin) largestWin = profit;
            }
            else if(profit < 0)
            {
                losingTrades++;
                if(profit < largestLoss) largestLoss = profit;
            }
        }
        
        if(dealTime >= weekStart)
        {
            weeklyPnL += profit;
        }
        
        if(dealTime >= monthStart)
        {
            monthlyPnL += profit;
        }
    }
}

//+------------------------------------------------------------------+
//| Check if should stop trading                                     |
//+------------------------------------------------------------------+
bool ShouldStopTrading()
{
    if(!EnablePnLLimits) return false;
    
    if(stopTradingToday) return true;
    
    if(DailyLossLimit > 0 && dailyPnL <= -DailyLossLimit)
    {
        Print("Daily loss limit reached: ", dailyPnL);
        stopTradingToday = true;
        return true;
    }
    
    if(DailyProfitTarget > 0 && dailyPnL >= DailyProfitTarget)
    {
        Print("Daily profit target reached: ", dailyPnL);
        stopTradingToday = true;
        return true;
    }
    
    if(MaxDailyTrades > 0 && dailyTrades >= MaxDailyTrades)
    {
        Print("Maximum daily trades reached: ", dailyTrades);
        return true;
    }
    
    if(WeeklyLossLimit > 0 && weeklyPnL <= -WeeklyLossLimit)
    {
        Print("Weekly loss limit reached: ", weeklyPnL);
        return true;
    }
    
    if(MonthlyLossLimit > 0 && monthlyPnL <= -MonthlyLossLimit)
    {
        Print("Monthly loss limit reached: ", monthlyPnL);
        return true;
    }
    
    return false;
}

//+------------------------------------------------------------------+
//| Reset daily tracking                                             |
//+------------------------------------------------------------------+
void ResetDailyTracking()
{
    dailyTrades = 0;
    stopTradingToday = false;
    Print("Daily tracking reset for new day");
}

//+------------------------------------------------------------------+
//| Close all positions                                              |
//+------------------------------------------------------------------+
void CloseAllPositions()
{
    int totalPositions = PositionsTotal();
    
    for(int i = totalPositions - 1; i >= 0; i--)
    {
        if(position.SelectByIndex(i))
        {
            if(position.Magic() == MagicNumber && position.Symbol() == _Symbol)
            {
                if(trade.PositionClose(position.Ticket()))
                {
                    Print("Position closed: ", position.Ticket());
                }
                else
                {
                    Print("Failed to close position: ", position.Ticket(), " Error: ", trade.ResultRetcode());
                }
            }
        }
    }
}

//+------------------------------------------------------------------+
//| Get date only (remove time)                                     |
//+------------------------------------------------------------------+
datetime GetDateOnly(datetime dt)
{
    MqlDateTime mdt;
    TimeToStruct(dt, mdt);
    mdt.hour = 0;
    mdt.min = 0;
    mdt.sec = 0;
    return StructToTime(mdt);
}

//+------------------------------------------------------------------+
//| Get week start                                                   |
//+------------------------------------------------------------------+
datetime GetWeekStart(datetime dt)
{
    MqlDateTime mdt;
    TimeToStruct(dt, mdt);
    
    int daysToSubtract = mdt.day_of_week;
    if(daysToSubtract == 0) daysToSubtract = 7;
    
    return GetDateOnly(dt - (daysToSubtract - 1) * 24 * 3600);
}

//+------------------------------------------------------------------+
//| Get month start                                                  |
//+------------------------------------------------------------------+
datetime GetMonthStart(datetime dt)
{
    MqlDateTime mdt;
    TimeToStruct(dt, mdt);
    mdt.day = 1;
    mdt.hour = 0;
    mdt.min = 0;
    mdt.sec = 0;
    return StructToTime(mdt);
}

//+------------------------------------------------------------------+
//| Create EMA lines on chart                                        |
//+------------------------------------------------------------------+
void CreateEMALines()
{
    RemoveEMALines();
    
    datetime currentTime = TimeCurrent();
    double currentPrice = SymbolInfoDouble(_Symbol, SYMBOL_BID);
    
    ObjectCreate(0, ema50_name, OBJ_TREND, 0, currentTime, currentPrice, currentTime + PeriodSeconds() * 100, currentPrice);
    ObjectSetInteger(0, ema50_name, OBJPROP_COLOR, EMA50_Color);
    ObjectSetInteger(0, ema50_name, OBJPROP_WIDTH, EMA50_Width);
    ObjectSetInteger(0, ema50_name, OBJPROP_STYLE, EMA50_Style);
    ObjectSetInteger(0, ema50_name, OBJPROP_BACK, true);
    ObjectSetInteger(0, ema50_name, OBJPROP_RAY_RIGHT, true);
    
    ObjectCreate(0, ema200_name, OBJ_TREND, 0, currentTime, currentPrice, currentTime + PeriodSeconds() * 100, currentPrice);
    ObjectSetInteger(0, ema200_name, OBJPROP_COLOR, EMA200_Color);
    ObjectSetInteger(0, ema200_name, OBJPROP_WIDTH, EMA200_Width);
    ObjectSetInteger(0, ema200_name, OBJPROP_STYLE, EMA200_Style);
    ObjectSetInteger(0, ema200_name, OBJPROP_BACK, true);
    ObjectSetInteger(0, ema200_name, OBJPROP_RAY_RIGHT, true);
    
    ObjectCreate(0, ema800_name, OBJ_TREND, 0, currentTime, currentPrice, currentTime + PeriodSeconds() * 100, currentPrice);
    ObjectSetInteger(0, ema800_name, OBJPROP_COLOR, EMA800_Color);
    ObjectSetInteger(0, ema800_name, OBJPROP_WIDTH, EMA800_Width);
    ObjectSetInteger(0, ema800_name, OBJPROP_STYLE, EMA800_Style);
    ObjectSetInteger(0, ema800_name, OBJPROP_BACK, true);
    ObjectSetInteger(0, ema800_name, OBJPROP_RAY_RIGHT, true);
    
    if(ShowLabels)
    {
        ObjectCreate(0, ema50_label, OBJ_TEXT, 0, currentTime, currentPrice);
        ObjectSetString(0, ema50_label, OBJPROP_TEXT, "EMA " + IntegerToString(EMA50_Period));
        ObjectSetInteger(0, ema50_label, OBJPROP_COLOR, LabelColor);
        ObjectSetInteger(0, ema50_label, OBJPROP_FONTSIZE, LabelFontSize);
        ObjectSetString(0, ema50_label, OBJPROP_FONT, "Arial");
        
        ObjectCreate(0, ema200_label, OBJ_TEXT, 0, currentTime, currentPrice);
        ObjectSetString(0, ema200_label, OBJPROP_TEXT, "EMA " + IntegerToString(EMA200_Period));
        ObjectSetInteger(0, ema200_label, OBJPROP_COLOR, LabelColor);
        ObjectSetInteger(0, ema200_label, OBJPROP_FONTSIZE, LabelFontSize);
        ObjectSetString(0, ema200_label, OBJPROP_FONT, "Arial");
        
        ObjectCreate(0, ema800_label, OBJ_TEXT, 0, currentTime, currentPrice);
        ObjectSetString(0, ema800_label, OBJPROP_TEXT, "EMA " + IntegerToString(EMA800_Period));
        ObjectSetInteger(0, ema800_label, OBJPROP_COLOR, LabelColor);
        ObjectSetInteger(0, ema800_label, OBJPROP_FONTSIZE, LabelFontSize);
        ObjectSetString(0, ema800_label, OBJPROP_FONT, "Arial");
    }
    
    ChartRedraw();
}

//+------------------------------------------------------------------+
//| Update EMA lines on chart                                        |
//+------------------------------------------------------------------+
void UpdateEMALines()
{
    if(ArraySize(ema50) < 1 || ArraySize(ema200) < 1 || ArraySize(ema800) < 1)
        return;
        
    datetime currentTime = TimeCurrent();
    datetime previousTime = currentTime - PeriodSeconds() * 50;
    
    ObjectMove(0, ema50_name, 0, previousTime, ema50[0]);
    ObjectMove(0, ema50_name, 1, currentTime, ema50[0]);
    
    ObjectMove(0, ema200_name, 0, previousTime, ema200[0]);
    ObjectMove(0, ema200_name, 1, currentTime, ema200[0]);
    
    ObjectMove(0, ema800_name, 0, previousTime, ema800[0]);
    ObjectMove(0, ema800_name, 1, currentTime, ema800[0]);
    
    if(ShowLabels)
    {
        ObjectMove(0, ema50_label, 0, currentTime, ema50[0]);
        ObjectMove(0, ema200_label, 0, currentTime, ema200[0]);
        ObjectMove(0, ema800_label, 0, currentTime, ema800[0]);
    }
}

//+------------------------------------------------------------------+
//| Remove EMA lines from chart                                      |
//+------------------------------------------------------------------+
void RemoveEMALines()
{
    ObjectDelete(0, ema50_name);
    ObjectDelete(0, ema200_name);
    ObjectDelete(0, ema800_name);
    ObjectDelete(0, ema50_label);
    ObjectDelete(0, ema200_label);
    ObjectDelete(0, ema800_label);
    ChartRedraw();
}

//+------------------------------------------------------------------+
//| Update indicator values                                          |
//+------------------------------------------------------------------+
bool UpdateIndicators()
{
    if(CopyBuffer(ema9_handle, 0, 0, 3, ema9) < 3 ||
       CopyBuffer(ema21_handle, 0, 0, 3, ema21) < 3 ||
       CopyBuffer(ema50_handle, 0, 0, 3, ema50) < 3 ||
       CopyBuffer(ema200_handle, 0, 0, 3, ema200) < 3 ||
       CopyBuffer(ema800_handle, 0, 0, 3, ema800) < 3 ||
       CopyBuffer(atr_handle, 0, 0, 3, atr) < 3)
    {
        Print("Error copying indicator values");
        return false;
    }
    
    return true;
}

//+------------------------------------------------------------------+
//| Check trend conditions                                           |
//+------------------------------------------------------------------+
void CheckTrendConditions()
{
    longTrendActive = (ema50[0] > ema200[0]) && (ema200[0] > ema800[0]);
    shortTrendActive = (ema50[0] < ema200[0]) && (ema200[0] < ema800[0]);
}

//+------------------------------------------------------------------+
//| Open long position                                               |
//+------------------------------------------------------------------+
void OpenLongPosition()
{
    double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
    double stopDistance = CalculateStopDistance();
    
    double adjustedLotSize = LotSize;
    double adjustedRR = RiskRewardRatio;
    
    switch(currentMode)
    {
        case CONSERVATIVE:
            adjustedLotSize = LotSize * 0.5;
            adjustedRR = RiskRewardRatio * 0.8;
            break;
        case MODERATE:
            break;
        case AGGRESSIVE:
            adjustedLotSize = LotSize * 1.5;
            adjustedRR = RiskRewardRatio * 1.2;
            break;
    }
    
    double sl = ask - stopDistance;
    double tp = ask + (stopDistance * adjustedRR);
    
    if(trade.Buy(adjustedLotSize, _Symbol, ask, sl, tp, "Long Entry"))
    {
        buyTicket = trade.ResultOrder();
        entryPrice = ask;
        initialStopLoss = sl;
        profitTarget = tp;
        riskAmount = stopDistance;
        tradeManaged = false;
        
        Print("Long position opened - Entry: ", entryPrice, " SL: ", sl, " TP: ", tp);
    }
    else
    {
        Print("Failed to open long position. Error: ", trade.ResultRetcode());
    }
}

//+------------------------------------------------------------------+
//| Open short position                                              |
//+------------------------------------------------------------------+
void OpenShortPosition()
{
    double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
    double stopDistance = CalculateStopDistance();
    
    double adjustedLotSize = LotSize;
    double adjustedRR = RiskRewardRatio;
    
    switch(currentMode)
    {
        case CONSERVATIVE:
            adjustedLotSize = LotSize * 0.5;
            adjustedRR = RiskRewardRatio * 0.8;
            break;
        case MODERATE:
            break;
        case AGGRESSIVE:
            adjustedLotSize = LotSize * 1.5;
            adjustedRR = RiskRewardRatio * 1.2;
            break;
    }
    
    double sl = bid + stopDistance;
    double tp = bid - (stopDistance * adjustedRR);
    
    if(trade.Sell(adjustedLotSize, _Symbol, bid, sl, tp, "Short Entry"))
    {
        sellTicket = trade.ResultOrder();
        entryPrice = bid;
        initialStopLoss = sl;
        profitTarget = tp;
        riskAmount = stopDistance;
        tradeManaged = false;
        
        Print("Short position opened - Entry: ", entryPrice, " SL: ", sl, " TP: ", tp);
    }
    else
    {
        Print("Failed to open short position. Error: ", trade.ResultRetcode());
    }
}

//+------------------------------------------------------------------+
//| Calculate stop distance                                          |
//+------------------------------------------------------------------+
double CalculateStopDistance()
{
    double stopDistance;
    
    if(UseATRForStopLoss)
    {
        stopDistance = atr[0] * ATRMultiplier;
    }
    else
    {
        stopDistance = 50.0 * _Point;
    }
    
    double minStop = SymbolInfoInteger(_Symbol, SYMBOL_TRADE_STOPS_LEVEL) * _Point;
    if(stopDistance < minStop)
    {
        stopDistance = minStop;
        Print("Stop distance adjusted to minimum: ", stopDistance);
    }
    
    return stopDistance;
}

//+------------------------------------------------------------------+
//| Manage existing position                                         |
//+------------------------------------------------------------------+
void ManagePosition()
{
    if(!position.SelectByMagic(_Symbol, MagicNumber)) return;
    if(tradeManaged) return;
        
    double currentPrice = (position.PositionType() == POSITION_TYPE_BUY) ? 
                         SymbolInfoDouble(_Symbol, SYMBOL_BID) : 
                         SymbolInfoDouble(_Symbol, SYMBOL_ASK);
    
    if(position.PositionType() == POSITION_TYPE_BUY)
    {
        double currentProfit = currentPrice - entryPrice;
        
        if(currentProfit >= riskAmount)
        {
            double newStopPrice;
            
            if(TrailToBreakeven)
            {
                newStopPrice = entryPrice;
            }
            else if(TrailWith1R)
            {
                newStopPrice = entryPrice + riskAmount;
            }
            else
            {
                newStopPrice = entryPrice;
            }
            
            if(newStopPrice > position.StopLoss())
            {
                if(trade.PositionModify(position.Ticket(), newStopPrice, position.TakeProfit()))
                {
                    tradeManaged = true;
                    Print("Long trailing stop activated - New stop: ", newStopPrice);
                }
                else
                {
                    Print("Failed to modify long position. Error: ", trade.ResultRetcode());
                }
            }
        }
    }
    else if(position.PositionType() == POSITION_TYPE_SELL)
    {
        double currentProfit = entryPrice - currentPrice;
        
        if(currentProfit >= riskAmount)
        {
            double newStopPrice;
            
            if(TrailToBreakeven)
            {
                newStopPrice = entryPrice;
            }
            else if(TrailWith1R)
            {
                newStopPrice = entryPrice - riskAmount;
            }
            else
            {
                newStopPrice = entryPrice;
            }
            
            if(newStopPrice < position.StopLoss() || position.StopLoss() == 0)
            {
                if(trade.PositionModify(position.Ticket(), newStopPrice, position.TakeProfit()))
                {
                    tradeManaged = true;
                    Print("Short trailing stop activated - New stop: ", newStopPrice);
                }
                else
                {
                    Print("Failed to modify short position. Error: ", trade.ResultRetcode());
                }
            }
        }
    }
}

//+------------------------------------------------------------------+
//| Reset trade variables                                            |
//+------------------------------------------------------------------+
void ResetTradeVariables()
{
    tradeManaged = false;
    entryPrice = 0;
    initialStopLoss = 0;
    profitTarget = 0;
    riskAmount = 0;
    buyTicket = 0;
    sellTicket = 0;
}

//+------------------------------------------------------------------+
//| Trade transaction function                                       |
//+------------------------------------------------------------------+
void OnTrade()
{
    UpdatePnLTracking();
}

//+------------------------------------------------------------------+
//| Trade server return codes                                        |
//+------------------------------------------------------------------+
void OnTradeTransaction(const MqlTradeTransaction& trans,
                        const MqlTradeRequest& request,
                        const MqlTradeResult& result)
{
    if(trans.type == TRADE_TRANSACTION_DEAL_ADD)
    {
        UpdatePnLTracking();
        
        if(ShowPnLMonitor)
        {
            UpdatePnLDisplay();
        }
        
        if(ShowControlPanel)
        {
            UpdateControlPanel();
        }
    }
}