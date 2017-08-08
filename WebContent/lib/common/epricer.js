Array.prototype.deleteByIndex=function(index){
	return this.splice(index,1)
}

Array.prototype.deleteByObj=function(obj){
	if (this.indexOf(obj)<0){
		return
	}else{
		this.deleteByIndex(this.indexOf(obj))
	}
}

Array.prototype.insert=function(value,allowDuplicated,errMsg){
	if (allowDuplicated==false){
		if (this.indexOf(value)>=0){
			alert(errMsg)
			return 
		}
		
		this.push(value)
	} else{
		this.push(value)
	}
}

Array.prototype.stringfy=function(seprator){
	if (this.length==1){
		return this[0]
	}
	
	var rst=''
	for (var i=0;i<this.length;i++){
		rst+=seprator+this[i]
	}
	
	return rst.substring(seprator.length)
}

Date.prototype.formatToDDMMMYYYY=function(){
	var m_names = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");

	var curr_date = this.getDate();
	var curr_month = this.getMonth();
	var curr_year = this.getFullYear();
	
	var dayStr=curr_date
	if (curr_date<9){
		dayStr="0"+curr_date
	}
	
	return dayStr+" "+m_names[curr_month]+" "+ curr_year
	
}