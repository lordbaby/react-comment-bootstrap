/*
从外层向最里层来写代码
 */

//1. 这个是最外层结构
var FilterableTable=React.createClass({
	getInitialState:function(){
		return {
			filterText:'',
			products:[]
		};
	},
	componentDidMount:function(){
		setTimeout(function(){
			this.props.promise.then(
				value => this.setState({products:value}),
				error => this.setState({products:[]})
			);
		}.bind(this),1000);
	},
	handleFilter:function(value){
		var timer=null;
		if(timer){
			return;
		}
	    timer=setTimeout(function(){
	   		
			var url='/api/products?text='+value.trim();
			$.getJSON(url,function(data){
				this.setState({products:data});
				clearTimeout(timer)
			}.bind(this));
			
	   }.bind(this),200)
		
	},
	render:function(){
		return (
			<div style={{margin:'20px'}}>
				<SearchBar 
					onFilter={this.handleFilter}
				/>
				<ProductTable 
					products={this.state.products}
					filterText={this.state.filterText}
				/>
			</div>
		);
	}
});

//搜索框（表单）
var SearchBar=React.createClass({
	handleTextChange:function(e){
		var value=e.target.value;
		this.props.onFilter(value);
	},
	render:function(){
		return (
			<form>
				<div className="form-group">
					<input type="text" className="form-control" onChange={this.handleTextChange} placeholder="Search..."  />
				</div>
			</form>
		);
	}
});

//搜索结果框（表格）
var ProductTable=React.createClass({
	render:function(){
		var rows=[];
		var lastCategory=null;
		
		for(var i=0;i<this.props.products.length;i++){
			var product=this.props.products[i];
			if(product.category!==lastCategory){
				rows.push(<ProductCategoryRow category={product.category} key={product.category} />)
			}
			rows.push(<ProductRow product={product} key={product.name} />);
			lastCategory=product.category;

		}
		return (
			<table className="table">
				<thead>
					<tr>
						<th>名称</th>
						<th>价格</th>
					</tr>
				</thead>
				<tbody>
					{rows}
				</tbody>
			</table>
		);
	}
});

//搜索结果分类

var ProductCategoryRow=React.createClass({
	render:function(){
		return (<tr><th colspan="2">{this.props.category}</th></tr>);
	}
});

//搜索结果

var ProductRow =React.createClass({
	render:function(){
		var name=this.props.product.stocked?this.props.product.name:<span style={{color:'red'}}>{this.props.product.name}</span>;
		return (
			<tr>
				<td>{name}</td>
				<td>{this.props.product.price}</td>
			</tr>
		);
	}
});


ReactDOM.render(<FilterableTable promise={$.getJSON('/api/products')}  />,document.getElementById('example'));