//<!-- (C)IBM Corporation 2006, 2007 -->  

// calendarHelper.js - javascript functions to manage a calendar pop-up helper

// calendarHelper - creates a pop-up window to help the user select a valid date
// returns the date as a String in a form input text field
// usage : call the function calendarHelper(targetField) where targetField is the name of the HTML Form input textfield
// a typical usage pattern would be :
//		<html:text size="8" property="myDate"/>
//		<epricer:w3img src="/images/v6/buttons/icon_calendar.gif" width="10" height="11" alt="calendar"
//		 onclick="javascript:calendarHelper(document.myForm.myDate)"/>&nbsp;<bean:message key="screen.general.calendarHelperDateFormat"/>
//
// and much better : using custom epricer tags that will do the same:
//		<epricer:calendar> or <epricer:date>
//
//	calendarHelper is managed by the object oriented (thanks Andrei!) function CalendarControl()
//
// This tool also comes with independant functions which purpose is to help you manage dates in many ways :
//
//	function getCalendarDate(fieldName) :
// 		returns a Date object from a calendar date field (supposedly based on calendarHelper format dd/MM/yyyy)
//		on error returns nothing
//		@param fieldName Name of the date control
//
//	function compareDates(date1,date2) :
//		makes a String comparison of the value of two given Date objects
//		(String expressed has yyyyMMdd)
//		@param date1 first operand date
//		@param date2 second operand date
//		returns -1, 0 or 1 as date1 is less than, equal to, or greater than date2.
//
//	function controlCalendarDate(fieldName, message) :
//		Control a calendar date field (based on calendarHelper format dd/MM/yyyy
//		@param fieldName Name of the date control
//		@param message Error message to display
//		returns false on error (displaying the error message), else returns true;
//
var v17MonthFormat = new Object();
v17MonthFormat['01']='Jan';
v17MonthFormat['02']='Feb';
v17MonthFormat['03']='Mar';
v17MonthFormat['04']='Apr';
v17MonthFormat['05']='May';
v17MonthFormat['06']='Jun';
v17MonthFormat['07']='Jul';
v17MonthFormat['08']='Aug';
v17MonthFormat['09']='Sep';
v17MonthFormat['10']='Oct';
v17MonthFormat['11']='Nov';
v17MonthFormat['12']='Dec';

var digitalMonthFormat = new Object();
digitalMonthFormat['JAN']='1';
digitalMonthFormat['FEB']='2';
digitalMonthFormat['MAR']='3';
digitalMonthFormat['APR']='4';
digitalMonthFormat['MAY']='5';
digitalMonthFormat['JUN']='6';
digitalMonthFormat['JUL']='7';
digitalMonthFormat['AUG']='8';
digitalMonthFormat['SEP']='9';
digitalMonthFormat['OCT']='10';
digitalMonthFormat['NOV']='11';
digitalMonthFormat['DEC']='12';


var K_CALENDAR_TITLE="ePricerV2 Custom Calendar";
var K_CALENDAR_BOX_TITLE="Choose Date";
var K_DATE_ORDER="DMY";
var K_DATE_SEPARATOR="/";
var K_MONTH_NAME_JAN="January";
var K_MONTH_NAME_FEB="February";
var K_MONTH_NAME_MAR="March";
var K_MONTH_NAME_APR="April";
var K_MONTH_NAME_MAY="May";
var K_MONTH_NAME_JUN="June";
var K_MONTH_NAME_JUL="July";
var K_MONTH_NAME_AUG="August";
var K_MONTH_NAME_SEP="September";
var K_MONTH_NAME_OCT="October";
var K_MONTH_NAME_NOV="November";
var K_MONTH_NAME_DEC="December";

var K_DAY_NAME_SUN="Sun";
var K_DAY_NAME_MON="Mon";
var K_DAY_NAME_TUE="Tue";
var K_DAY_NAME_WED="Wed";
var K_DAY_NAME_THU="Thu";
var K_DAY_NAME_FRI="Fri";
var K_DAY_NAME_SAT="Sat";

function CalendarControl() {

	this.year;
	this.month;
	this.day;
	this.textField;
	this.textFieldV17;
	this.boxTitle;
	this.ctrlVarName;
	this.today;

	this.chooseDate = function(textField, boxTitle, ctrlVarName) {
		this.textField = textField;
		this.textFieldV17 = document.getElementById(textField.id + "_V17tmp");
		this.boxTitle = boxTitle;
		this.ctrlVarName = ctrlVarName;
		this.parseDate();
		this.refreshPopup(this.year, this.month);
	}
	
	this.daysPerMonth = function(year, month) {
		var tmpDate = new Date(year, month, 0);
		var maxDay = tmpDate.getDate();
		return maxDay;
	};

	this.buildMonthSelect = function(selectedMonth) {
		var ret = "<select title='Month' name='month' id='month' style='width:100px;' size='1' onchange='javascript:opener." +
			this.ctrlVarName + ".refreshPopup(self.document.Forma1.year[self.document.Forma1.year.selectedIndex].value, " +
			"self.document.Forma1.month[self.document.Forma1.month.selectedIndex].value);'>\r\n";
		for (var i = 1; i <= 12; i++) {
			ret = ret + "  <option value='" + i + "'";
			if (i == selectedMonth) 
			{
				ret = ret + " selected";
			}
			ret = ret + ">" + this.monthNames[i - 1] + "</option>\r\n";
		}
		ret = ret + "</select>\r\n";
		return ret;
	}

	this.buildYearSelect = function(selectedYear) {
		var ret = "<select title='Year' name='year' id='year' style='width:75px;' size='1' onchange='javascript:opener." + 
			this.ctrlVarName + ".refreshPopup(self.document.Forma1.year[self.document.Forma1.year.selectedIndex].value, " +
			"self.document.Forma1.month[self.document.Forma1.month.selectedIndex].value);'>\r\n";
		for(var i = this.minYear; i <= this.maxYear; i++) 
		{
			ret = ret + "  <option value='" + i + "'";
			if (i == selectedYear)
			{
				ret = ret + " selected";
			}
			ret = ret + ">" + i + "</option>\r\n";
		}
		ret = ret + "</select>\r\n";
		return ret;
	}

	this.buildDaysTable = function(yearNumber, monthNumber) 
	{
		// background-color updated for TIR USRO-R-LPAS-6NYGY3 on date 16-5-2006 by chaitanya
		var ret =
			'<table border="0" cellpadding="0" cellspacing="2" align="center">\r\n' +
			'<tr align="center" style="background-color:#6699CC; color:white">\r\n    ';
		var initialDate = new Date(yearNumber, monthNumber - 1, 1);
		// day names row
		for(var i = 0; i < this.dayNames.length; i++)
		{
			// background-color updated for TIR USRO-R-LPAS-6NYGY3 on date 16-5-2006 by chaitanya
			// Changes For TIR USRO-R-LWCG-7476HT Starts
			ret = ret + '<td style="background-color:#6699CC; color:white; width:35px"'+ '>' + this.dayNames[i] + '</td>'
			// Changes For TIR USRO-R-LWCG-7476HT Ends
		}
		ret = ret + '</tr>\r\n' +
			'    <tr align="center">\r\n' +
			'        ';
		// empty days at start
		var emptyCount = initialDate.getDay();
		for (var i = 1; i <= emptyCount; i++) {
			ret = ret + '<td></td>';
		}
		ret = ret + '\r\n';
		var maxDay = this.daysPerMonth(yearNumber, monthNumber);
		var today = new Date();
		for (var i = 1; i <= maxDay; i++) 
		{
		//Fix for IN249434 for IE8 change the width
			var style = 'width:30px;';
			if ((i == this.day) && (monthNumber == this.month) &&
				(yearNumber == this.year))
			{
				// color updated for TIR USRO-R-LPAS-6NYGY3 on date 16-5-2006 by chaitanya
				style += ' font-weight:bold; color:#6699CC;';
			}
			ret +=
				'        <td>\r\n' +
				'            <input type="button" class="ibm-btn-arrow-sec ibm-btn-small" name="btnDate" style="' + style + '" value="' + ((i < 10) ? "0" : "") + i + '" ' +
					'onclick="javascript:opener.' + this.ctrlVarName + 
					'.year=self.document.Forma1.year[self.document.Forma1.year.selectedIndex].value; ' +
				'opener.' + this.ctrlVarName + 
					'.month=self.document.Forma1.month[self.document.Forma1.month.selectedIndex].value; ' +
				'opener.' + this.ctrlVarName + 
					'.day=' + i + '; self.close();"/>';
			ret = ret + '</td>\r\n';
		    if(((i+emptyCount) % 7) == 0)
		    {
				ret = ret + '\r\n' +
					'    </tr>\r\n' +
					'    <tr align="center">';
		    }
		}
		ret = ret + '\r\n' +
			'    </tr>\r\n' +
			'</table>';
		return ret;
	}

	this.refreshPopup = function(yearNumber, monthNumber) {
		//fix for TIR USRO-R-CMUD-6NJK3D put DOCTYPE outside of <head> that Content-Type must be first meta tag after <head>
		var html =
			'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">' +
			'<html lang="lc-cc" xmlns="http://www.w3.org/1999/xhtml"> \r\n' +
			'<head>' +
			'<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>' +
			'<meta name="dc.date" scheme="iso8601" content="2004-06-02"/>' +
			'<meta name="description" content="E-pricer application calendar helper"/>' +
			'<meta name="keywords" content="e-pricer,IBM,w3,pricing"/>' +
			'<meta name="owner" content="wjbucko@us.ibm.com"/>' +
			'<meta name="robots" content="index,follow"/>' +
			'<meta name="source" content="v17 template generator"/>' +
			'<meta name="ibm.country" content="US"/>'+
			'<meta name="dc.language" scheme="rfc1766" content="en-US"/>'+
			'<meta name="security" content="internal use only"/>'+
			'<meta name="DC.Rights" content="copyright (c) 2001 by IBM corporation"/>'+
			'<meta name="feedback" content="wjbucko@us.ibm.com"/>'+
			'<style media="all" type="text/css">'+
			'.hidden-label'+
			'{'+
			'position:absolute;	left:0px; top:-100px; width:1px; height:1px; overflow:hidden;'+
			'}'+
			'</style>\r\n'+
			'   <title>' + this.boxTitle + '</title>\r\n' +
			'	<style type="text/css" >\r\n' +
			'	span, p, ul, ol, td, th, blockquote {font-size:10pt; }\r\n' +
			'	</style>\r\n' +
			'</head>\r\n' +
			'<body bgcolor="#ffffff" onunload="opener.' + this.ctrlVarName + '.saveDate();" style="font-size:8pt">\r\n' +
			'    <form name="Forma1">\r\n' +
			// color updated for TIR USRO-R-LPAS-6NYGY3 on date 16-5-2006 by chaitanya
			'    <div style="border: solid #6699CC 1px;" align="center">' +
			'        <table width="100%">\r\n' +
			'            <tr align="center">' +
			// color updated for TIR USRO-R-LPAS-6NYGY3 on date 16-5-2006 by chaitanya
			'                <td><span style="font-size: 13pt; color:#ff9900">' + K_CALENDAR_BOX_TITLE + '</span></td></tr>\r\n' +
			'        </table>\r\n' +
			this.buildMonthSelect(monthNumber) +
			this.buildYearSelect(yearNumber) +
			this.buildDaysTable(yearNumber, monthNumber);
		var today = new Date();
		var curDateStr = this.formatDateV17(today.getFullYear(), today.getMonth() + 1, today.getDate());
		// TIR USRO-R-NTAN-6YDJZW by Priyanka on 16/02/07
		html += 
			'        <input type="button" class="ibm-btn-arrow-sec ibm-btn-small" style="width:150px;" name="hoy" value="Today: ' + curDateStr + 
				'" onclick="javascript:opener.' + this.ctrlVarName + '.year=' + today.getFullYear() + 
				'; opener.' + this.ctrlVarName + '.month= ' + (today.getMonth() + 1) + 
				'; opener.' + this.ctrlVarName + '.day=' + today.getDate() + '; self.close();"/>\r\n' +
			'        <br />&#160;\r\n' +
			'        </div>\r\n' +
			'    </form>\r\n' +
			'</body>\r\n' +
			'</html>';
	//End TIR USRO-R-NTAN-6YDJZW by Priyanka on 16/02/07
		// Changes For TIR USRO-R-LWCG-7476HT Starts
		var popup = open("","calendar","width=270,height=290");
		// Changes For TIR USRO-R-LWCG-7476HT Ends
		popup.document.open();
		popup.document.writeln(html);
		popup.document.close();
		//Changes for TIR USRO-R-RMAI-766DUC Starts by Jitendra. 
		//popup.document.location.reload(true);
		//Changes for TIR USRO-R-RMAI-766DUC Ends.
		popup.focus();
		}
	
	this.saveDate = function() {
		var formattedDate = this.formatDate(this.year, this.month, this.day);
		if(formattedDate)
		{
			this.textField.value = formattedDate;
			var formattedDateV17 = this.formatDateV17(this.year, this.month, this.day);

			if(formattedDateV17 && this.textFieldV17 != null)
			{
				this.textFieldV17.value = formattedDateV17;
			}
			if(this.textField.onchange)
			{
				this.textField.onchange();
			}
		}
	}
	
	this.formatDate = function(year, month, day)
	{
	
		if(!day || !month || !year)
		{
			return '';
		}
		var dayStr = new String(day);
		if(dayStr.length == 1)
		{
			dayStr = "0" + dayStr;
		}
		var monthStr = new String(month);
		if(monthStr.length == 1)
		{
			monthStr = "0" + monthStr;
		}
		var ret = '';
		CalendarControl.prototype.dateOrder = "MDY";
		
		for(var i = 0; i < this.dateOrder.length; i++)
		{
			if(ret.length > 0)
			{
				ret += this.dateSeparator;
			}
			switch(this.dateOrder.charAt(i))
			{
				case 'Y':
					ret += year;
					break;
				case 'M':
					ret += monthStr;
					break;
				case 'D':
					ret += dayStr;
					break;
			}
		}
		return ret;
	}
	
	this.formatDateV17 = function(year, month, day)
	{
	
		if(!day || !month || !year)
		{
			return '';
		}
		var dayStr = new String(day);
		if(dayStr.length == 1)
		{
			dayStr = "0" + dayStr;
		}
		var monthStr = new String(month);
		if(monthStr.length == 1)
		{
			monthStr = "0" + monthStr;
		}
		
		if (v17MonthFormat[monthStr])
			monthStr = v17MonthFormat[monthStr];

		var ret = dayStr + ' ' + monthStr + ' ' + year;
		return ret;
	}
	
	this.parseDate = function()
	{
		var value = this.textField.value;
		var today = new Date();
		if(!value)
		{
			value = this.formatDate(today.getFullYear(), today.getMonth() + 1, today.getDate());
			//return;
		}
		var regexStr = '^';
		
		for(var i = 0; i < this.dateOrder.length; i++)
		{
			if(regexStr.length > 1)
			{
				regexStr += this.dateSeparator;
			}
			regexStr += '(\\d+)';
		}
		regexStr += '$';
		var regex = new RegExp(regexStr, 'g');
		var parts = regex.exec(value);
		
		if(parts == null)
		{
			value = this.formatDate(today.getFullYear(), today.getMonth() + 1, today.getDate());
			parts = regex.exec(value);
		}
		
		if(parts)
		{
			for(var i = 0; i < this.dateOrder.length; i++)
			{
				switch(this.dateOrder.charAt(i))
				{
					case 'Y':
						this.year = parts[i + 1];
						break;
					case 'M':
						this.month = parts[i + 1];
						break;
					case 'D':
						this.day = parts[i + 1];
						break;
				}
			}
		}
	}
	
}

CalendarControl.prototype = new CalendarControl();
CalendarControl.prototype.monthNames = Array(
	K_MONTH_NAME_JAN, K_MONTH_NAME_FEB, K_MONTH_NAME_MAR,
	K_MONTH_NAME_APR, K_MONTH_NAME_MAY, K_MONTH_NAME_JUN,
	K_MONTH_NAME_JUL, K_MONTH_NAME_AUG, K_MONTH_NAME_SEP,
	K_MONTH_NAME_OCT, K_MONTH_NAME_NOV, K_MONTH_NAME_DEC);
CalendarControl.prototype.dayNames = Array(K_DAY_NAME_SUN, K_DAY_NAME_MON, K_DAY_NAME_TUE, K_DAY_NAME_WED,
	K_DAY_NAME_THU, K_DAY_NAME_FRI, K_DAY_NAME_SAT);
CalendarControl.prototype.dateOrder = K_DATE_ORDER;
CalendarControl.prototype.dateSeparator = K_DATE_SEPARATOR;
CalendarControl.prototype.minYear = 1960;
CalendarControl.prototype.maxYear = 2100;

function calendarHelper(targetField,targetDateOrder)
{    
	if (targetDateOrder != null)
    {
      this.dateOrder = targetDateOrder;
      CalendarControl.prototype.dateOrder = targetDateOrder; 
    }
	
	this.calendarControl = new CalendarControl();
	this.calendarControl.chooseDate(targetField, K_CALENDAR_TITLE, 'calendarControl');
}

/**
* set hours, minutes, seconds and milliseconds of the given date to zero
*
*
*/
function zeroHours(theDate)
{
	theDate.setHours(0);
	theDate.setMinutes(0);
	theDate.setSeconds(0);
	theDate.setMilliseconds(0);
}

/**
* returns a Date from a calendar date field (based on calendarHelper format dd/MM/yyyy)
* on error returns nothing
* @param fieldName Name of the date control
**/
function getCalendarDate(targetField)
{
		
	var targetFieldValue = "";
	var dateRetour = "";
	var yearValue = "";
	var monthValue = "";
	var dayValue = "";
	var intYearValue = 0;
	var intMontValue = 0;
	var intDayValue = 0;
	if (targetField.value == "")
	{
		dateRetour  = new Date(intYearValue, intMontValue, intDayValue);	
		return dateRetour;
	}
	else
	{
		// Extract year/month/day values as strings
		targetFieldValue = targetField.value;
		yearValue = targetFieldValue.substring(6,10);
		
		////Fixed for TIR USRO-R-SGAR-72UJEV : Starts
		//monthValue = targetFieldValue.substring(3,5);
		//dayValue = targetFieldValue.substring(0,2);
		dayValue = targetFieldValue.substring(3,5);
		monthValue = targetFieldValue.substring(0,2);
		////Fixed for TIR USRO-R-SGAR-72UJEV : Ends
		
			//alert("targetFieldValue >>"+targetFieldValue+"<<");
		if ((document.QUOTE_INFORMATION_BODY!=null)&&(document.QUOTE_INFORMATION_BODY.dateFormat.value.substring(0,1)=='M'))	
		{
		 yearValue = targetFieldValue.substring(6,10);
		 monthValue = targetFieldValue.substring(0,2);
		 dayValue = targetFieldValue.substring(3,5);
        }	
        //fix by vivek for yy/mm/dd for Japan Tir:#7f4j9h
		if ((document.QUOTE_INFORMATION_BODY!=null)&&(document.QUOTE_INFORMATION_BODY.dateFormat.value.substring(0,1)=='Y'))
		{ 
	  yearValue = targetFieldValue.substring(0,4);
	  monthValue = targetFieldValue.substring(5,7);
	  dayValue = targetFieldValue.substring(8,10);
		}
		//fix by vivek for yy/mm/dd for Japan Tir:#7f4j9h
        //TIR USRO-R-GKRA-74RB98 by navneet start
        else if ((document.QUOTE_INFORMATION_BODY!=null)&&(document.QUOTE_INFORMATION_BODY.dateFormat.value.substring(0,1)=='D'))	
        {
        	dayValue = targetFieldValue.substring(0,2);
		 	monthValue = targetFieldValue.substring(3,5);
	    }	
        //TIR USRO-R-GKRA-74RB98 by navneet ends
        
        //IDD G6345 Extended Search - Sonal
        if ((document.searchCriteria!=null)&&(localeSettings.dateOrder.toUpperCase().substring(0,1)=='M'))	
		{
		 yearValue = targetFieldValue.substring(6,10);
		 monthValue = targetFieldValue.substring(0,2);
		 dayValue = targetFieldValue.substring(3,5);
        }
		//End IDD G6345 Extended Search - Sonal
		// NG 03/28/05 23301889
		if ((document.PricingDetailsForm!=null)&&(document.PricingDetailsForm.dateFormat.value.substring(0,1)=='M'))
		{ 
		
		var yearValue = targetFieldValue.substring(6,10);
		var monthValue = targetFieldValue.substring(0,2);
		var dayValue = targetFieldValue.substring(3,5);
		}
		//fix by vivek for yy/mm/dd for Japan Tir:#7f4j9h
		if ((document.PricingDetailsForm!=null)&&(document.PricingDetailsForm.dateFormat.value.substring(0,1)=='Y'))
		{ 
	  	var yearValue = targetFieldValue.substring(0,4);
	  	var monthValue = targetFieldValue.substring(5,7);
	  	var dayValue = targetFieldValue.substring(8,10);
		}
		//end fix by vivek for yy/mm/dd for Japan Tir:#7f4j9h
		// NG 03/28/05 23301889
        // START - Fix for MN : 34580618 - Jalaj Sachdeva
		if ((document.NewCustomer!=null)&&(document.NewCustomer.dateFormat && document.NewCustomer.dateFormat != null && document.NewCustomer.dateFormat.value.substring(0,1)=='M'))
		{ 		
			var yearValue = targetFieldValue.substring(6,10);
			var monthValue = targetFieldValue.substring(0,2);
			var dayValue = targetFieldValue.substring(3,5);
		}
		// END - Fix for MN : 34580618 - Jalaj Sachdeva
			//alert("String yearValue ="+yearValue+" monthValue="+monthValue+" dayValue="+dayValue);
		// Convert strings values as int (note the month shift for instantiating the date)		
		intYearValue = parseInt(yearValue,10);
		intMonthValue = parseInt(monthValue,10) -1;
		intDayValue = parseInt(dayValue,10);
			//alert("int intYearValue ="+intYearValue+" intMonthValue="+intMonthValue+" intDayValue="+intDayValue);		
		dateRetour  = new Date(intYearValue, intMonthValue, intDayValue);	
		return dateRetour;
	}

}

/**
* makes a String comparison of the value of two given Date objects
* (String expressed has yyyyMMdd)
* @param date1 first operand date
* @param date2 second operand date
* @ returns -1, 0 or 1 as date1 is less than, equal to, or greater than date2.
**/
function compareDates(date1,date2)
{
	// build the string compDate1 (format yyyyMMdd) upon date1 value
	var y1Value = date1.getFullYear();
	var m1Value = date1.getMonth() + 1;
	var d1Value = date1.getDate();
	var compDate1 = y1Value+fmtNN(m1Value)+fmtNN(d1Value);
	//alert('compDate1='+compDate1);

	// build the string compDate2 (format yyyyMMdd) upon date2 value
	var y2Value = date2.getFullYear();
	var m2Value = date2.getMonth() + 1;
	var d2Value = date2.getDate();
	var compDate2 = y2Value+fmtNN(m2Value)+fmtNN(d2Value);
	//alert('compDate2='+compDate2);
	//compare Dates
	if (compDate1 < compDate2)
	{
		//alert("return -1");
		return -1;
	}
	else if  (compDate1 == compDate2)
	{
		//alert("return 0");
		return 0;
	}
	else if (compDate1 > compDate2)
	{
		//alert("return 1");
		return 1;
	}
	else
	{
		//alert("undefined");
		return "undefined";
	}
}

/**
* Control a calendar date field (based on calendarHelper format dd/MM/yyyy
* @param fieldName Name of the date control
* @param message Error message to display
*/
function controlCalendarDate(targetField, message,dateFormat)
{   // Extract the values
	var targetFieldValue = new String(targetField.value);
	var yearValue = targetFieldValue.substring(6,10);
	var monthValue = targetFieldValue.substring(3,5);
	var dayValue = targetFieldValue.substring(0,2);
	if ((document.QUOTE_INFORMATION_BODY!=null)&&(document.QUOTE_INFORMATION_BODY.dateFormat.value.substring(0,1)=='M'))
	{ 
	  var yearValue = targetFieldValue.substring(6,10);
	  var monthValue = targetFieldValue.substring(0,2);
	  var dayValue = targetFieldValue.substring(3,5);
	}
	//fix by vivek for yy/mm/dd for Japan Tir:#7f4j9h
	if ((document.QUOTE_INFORMATION_BODY!=null)&&(document.QUOTE_INFORMATION_BODY.dateFormat.value.substring(0,1)=='Y'))
	{ 
	  var yearValue = targetFieldValue.substring(0,4);
	  var monthValue = targetFieldValue.substring(5,7);
	  var dayValue = targetFieldValue.substring(8,10);
	}
	//end fix by vivek for yy/mm/dd for Japan Tir:#7f4j9h
	//IDD G6345 Extended Search - Sonal
	if ((document.searchCriteria!=null)&&(localeSettings.dateOrder.toUpperCase().substring(0,1)=='M'))
	{ 
	  var yearValue = targetFieldValue.substring(6,10);
	  var monthValue = targetFieldValue.substring(0,2);
	  var dayValue = targetFieldValue.substring(3,5);
	}
	//End - Sonal
	// NG 03/28/05 23301889
	if ((document.PricingDetailsForm!=null)&&(document.PricingDetailsForm.dateFormat.value.substring(0,1)=='M'))
	{ 
	  var yearValue = targetFieldValue.substring(6,10);
	  var monthValue = targetFieldValue.substring(0,2);
	  var dayValue = targetFieldValue.substring(3,5);
	}
	//fix by vivek for yy/mm/dd for Japan Tir:#7f4j9h
	if ((document.PricingDetailsForm!=null)&&(document.PricingDetailsForm.dateFormat.value.substring(0,1)=='Y'))
	{ 
	  var yearValue = targetFieldValue.substring(0,4);
	  var monthValue = targetFieldValue.substring(5,7);
	  var dayValue = targetFieldValue.substring(8,10);
	}
	//end fix by vivek for yy/mm/dd for Japan Tir:#7f4j9h
	//Fix for TIR USRO-R-RGAI-738FKJ Pankaj Jaiswal Start
    if ((document.ApprovalBPOnlyForm!=null)&&(document.ApprovalBPOnlyForm.dateFormat.value.substring(0,1)=='M'))
	{ 
	  yearValue = targetFieldValue.substring(6,10);
	  monthValue = targetFieldValue.substring(0,2);
	  dayValue = targetFieldValue.substring(3,5);
	}
	//Fix for TIR USRO-R-RGAI-738FKJ Pankaj Jaiswal End
	// Fix by Jalaj
	if ((document.NewCustomer!=null)&&(document.NewCustomer.dateFormat && document.NewCustomer.dateFormat != null && document.NewCustomer.dateFormat.value.substring(0,1)=='M'))
	{ 
	  yearValue = targetFieldValue.substring(6,10);
	  monthValue = targetFieldValue.substring(0,2);
	  dayValue = targetFieldValue.substring(3,5);
	}
	// NG 03/28/05 23301889
	
	// Check the date fields
	if (!isNumeric(yearValue))
	{
		alert (message + "\n" + K_CONTROL_DATE_YEAR_NUMERIC);
		return false;
	}
	if (isNaN(monthValue))
	{
		alert (message + "\n" + K_CONTROL_DATE_MONTH_NUMERIC);
		return false;
	}
	if (isNaN(dayValue))
	{
		alert (message + "\n" + K_CONTROL_DATE_DAY_NUMERIC);
		return false;
	}
	// Parse the date fields
	var year = parseInt (yearValue, 10);
	var month = parseInt (monthValue, 10);
	var day = parseInt (dayValue, 10);
	
	// Check the year
	if (!isYearValid(year))
	{
		alert(message + "\n" + K_CONTROL_DATE_YEAR_VALID);
		return false;
	}
	else if (month >= 1 && month <= 12)
	{
		if (month == 2)
		{
			if (day < 1 || day > 29)
			{
				alert(message + "\n" + K_CONTROL_DATE_DAY_VALID);
				return false;
			}
			else if (day == 29)
			{
				if (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0))
				{
					// Ok
				}
				else
				{
					alert(message + "\n" + K_CONTROL_DATE_DAY_LEAPYEAR);
					return false;
				}
			}
			else
			{
				// Ok
			}
		}
		else if (month == 1 || month == 3 || month == 5 ||month == 7 || month == 8 || month == 10 || month == 12)
		{
			if (day < 1 || day > 31)
			{
				alert(message + "\n" + K_CONTROL_DATE_DAY_VALID);
				return false;
			}
			else
			{
				// Ok
			}
		}
		else
		{
			if (day < 1 || day > 30)
			{
				alert(message + "\n" + K_CONTROL_DATE_DAY_VALID);
				return false;
			}
			else
			{
				// Ok
			}
		}
	}
	else
	{
		alert(message + "\n" + K_CONTROL_DATE_MONTH_VALID);
		return false;
	}

	// Ok
	return true;
}
//TIR USRO-R-NTAN-6YDJZW by Priyanka on 16/02/07
function trimStr(strDate)
{
	var str='';
	for(var i=0;i<strDate.length;i++)
	{
    	if(strDate.substring(i,i+1)==' ')
        {
			str=str;
		}
		else
		{
			str= str + strDate.substring(i,i+1);
		}
	}
	return str;
	
}
//End TIR USRO-R-NTAN-6YDJZW by Priyanka on 16/02/07
// START - Fix for MN : 34580618 - Jalaj Sachdeva
// Added new method checkDateFormat() for setting the date acc to the dateFormat and returning the date in MDY format.
function checkDateFormat(inputDate, dateFmt)
{
	if(dateFmt=='MDY')
		{
			var monthValue = inputDate.substring(0,2);
			var dayValue = inputDate.substring(3,5);
	        var yearValue= inputDate.substring(6,15);
	    }
		else if(dateFmt=='DMY')
		{
			var dayValue = inputDate.substring(0,2);
			var monthValue = inputDate.substring(3,5);
			var yearValue= inputDate.substring(6,15);
		}
//fix by vivek for yy/mm/dd for Japan Tir:#7f4j9h
		else if(dateFmt=='YMD')
			{
			var yearValue= inputDate.substring(0,4);
	 	 	var monthValue= inputDate.substring(5,7);
	  		var dayValue = inputDate.substring(8,10);
	  		}
//end fix by vivek for yy/mm/dd for Japan Tir:#7f4j9h
		if(!dayValue || !monthValue || !yearValue  || dayValue == null || monthValue == null || yearValue == null)
	    {
	    	alert("Improper date format.");
	    	return null;    
	    }
		inputDate = monthValue+"/"+dayValue+"/"+yearValue;
		return new Date(inputDate);
}
// END - Fix for MN : 34580618 - Jalaj Sachdeva

//Added for V17 migration of IBM GUI by Sagnik/Anshuman
function validateV17Date(textBoxObject, initializeV17Field, expectedDateFormat){
	if (textBoxObject == null){
		return;
	}
	var v17DatePattern = /^(\d{2})\s([A-Z]{3})\s(\d{4})$/;
	var dateTextBox = textBoxObject.value.toUpperCase();
	
	if (expectedDateFormat){
		expectedDateFormat = expectedDateFormat.toUpperCase();
	}

	this.dateOrder = K_DATE_ORDER;
	this.dateSeparator = K_DATE_SEPARATOR;

	this.formatDate = function(year, month, day, expectedDateFormat)
	{
	
		if(!day || !month || !year)
		{
			return '';
		}
		var dayStr = new String(day);
		if(dayStr.length == 1)
		{
			dayStr = "0" + dayStr;
		}
		var monthStr = new String(month);
		if(monthStr.length == 1)
		{
			monthStr = "0" + monthStr;
		}
		var ret = '';
		if (expectedDateFormat.length > 3)
		{
			expectedDateFormat = expectedDateFormat.toUpperCase();
			var dateSeperatorArray = expectedDateFormat.split(/[A-Z]+/)
			var dateSeperator = " ";
				if (dateSeperatorArray != null && dateSeperatorArray.length > 0){
				dateSeperator = dateSeperatorArray[1];
			}
			
			var dateExapmleSplitArray = expectedDateFormat.split( dateSeperator );
			
			if (dateExapmleSplitArray.length >= 3) {
				if (dateExapmleSplitArray[0].indexOf("(") == 0)
				{
					dateExapmleSplitArray[0] = dateExapmleSplitArray[0].substring(1);
					}
				expectedDateFormat = dateExapmleSplitArray[0].substring(0,1) + dateExapmleSplitArray[1].substring(0,1) + dateExapmleSplitArray[2].substring(0,1);
			
			} else {
				expectedDateFormat = "MDY";
			}
		}
		dateOrder = expectedDateFormat;
	
		for(var i = 0; i < this.dateOrder.length; i++)
		{
			if(ret.length > 0)
			{
				ret += this.dateSeparator;
			}
			switch(this.dateOrder.charAt(i))
			{
				case 'Y':
					ret += year;
					break;
				case 'M':
					ret += monthStr;
					break;
				case 'D':
					ret += dayStr;
					break;
			}
		}
		return ret;
	}

	// the first condition will only be used when no validations are to be done and an initial value is to be set in the calendar component
	if (initializeV17Field){
		var hiddenID = textBoxObject.id.replace('_V17tmp', '');
		if(document.getElementById(hiddenID) != null){
			var currentDate = document.getElementById(hiddenID).value;
			var monthValue = '';
			var dayValue = '';
	        var yearValue= '';
			var inputDate=currentDate;

			if (!currentDate){
				return;
			}

			if (inputDate && inputDate.length < 10){
				var dateSeparatorArray = inputDate.split(/[0-9]/);
				if (dateSeparatorArray && dateSeparatorArray.length > 1){
				    var dateSeparatorField = dateSeparatorArray[1];
				    var dateFields = inputDate.split(dateSeparatorField);
				    if (dateFields && dateFields.length == 3){
				        inputDate = ((dateFields[0] < 10)? "0" + dateFields[0]:dateFields[0]) + dateSeparatorField + ((dateFields[1] < 10)? "0" + dateFields[1]:dateFields[1]) + dateSeparatorField + ((dateFields[2] < 10)? "0" + dateFields[2]:dateFields[2]);
				    }
				}
			}
			
			if (expectedDateFormat.length > 3){
				expectedDateFormat = expectedDateFormat.toUpperCase();
				var dateSeperatorArray = expectedDateFormat.split(/[A-Z]+/)
				var dateSeperator = " ";
					if (dateSeperatorArray != null && dateSeperatorArray.length > 0){
					dateSeperator = dateSeperatorArray[1];
				}
				
				var dateExapmleSplitArray = expectedDateFormat.split( dateSeperator );
				
				if (dateExapmleSplitArray.length >= 3) {
					if (dateExapmleSplitArray[0].indexOf("(") == 0)
					{
						dateExapmleSplitArray[0] = dateExapmleSplitArray[0].substring(1);
						}
					expectedDateFormat = dateExapmleSplitArray[0].substring(0,1) + dateExapmleSplitArray[1].substring(0,1) + dateExapmleSplitArray[2].substring(0,1);
				
				} else {
					expectedDateFormat = "MDY";
				}
			}
			dateOrder = expectedDateFormat;

			if(dateOrder=='MDY')
			{
				monthValue = inputDate.substring(0,2);
				dayValue = inputDate.substring(3,5);
		        yearValue= inputDate.substring(6,15);
		    }
			else if(dateOrder=='DMY')
			{
				dayValue = inputDate.substring(0,2);
				monthValue = inputDate.substring(3,5);
				yearValue= inputDate.substring(6,15);
			}
			else if(dateOrder=='YMD')
			{
			yearValue= inputDate.substring(0,4);
	 	 	monthValue= inputDate.substring(5,7);
	  		dayValue = inputDate.substring(8,10);
	  		}
			if (textBoxObject != null){
				if (!dayValue || !v17MonthFormat[monthValue] || !yearValue){
					textBoxObject.value = inputDate;
				}else{
					textBoxObject.value = dayValue + " " + v17MonthFormat[monthValue] + " " + yearValue;
				}
			}

		}
		
	}
	else if(!(v17DatePattern.test(dateTextBox))){
		alert("Improper date format");
		var hiddenID = textBoxObject.id.replace('_V17tmp', '');
		if(document.getElementById(hiddenID) != null){
			textBoxObject.value = '';
			document.getElementById(hiddenID).value = '';
		}
	}else{
		var userDate = dateTextBox.split(" ");
		if (!digitalMonthFormat[userDate[1]]){
			alert("Improper date format.");
			var hiddenID = textBoxObject.id.replace('_V17tmp', '');
			if(document.getElementById(hiddenID) != null){
				textBoxObject.value = '';
				document.getElementById(hiddenID).value = '';
			}
		}else{
			userDate[1] = digitalMonthFormat[userDate[1]];
			var hiddenID = textBoxObject.id.replace('_V17tmp', '');
			var hiddenTextField = document.getElementById(hiddenID);
			if(hiddenTextField != null){
				hiddenTextField.value = this.formatDate(userDate[2], userDate[1], userDate[0], expectedDateFormat);
				if(hiddenTextField.onchange)
				{
					hiddenTextField.onchange();
				} 
			}
		}
	}
}

