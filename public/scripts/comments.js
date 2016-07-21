
/**
 * 组件从上到下依次是 评论，评论列表，评论表单，最后也是最外的整个评论组件
 *
 * 结构
 * <CommentBox />
 * 		<CommentList />
 * 		<CommentForm />
 * 			<Ueditor />
 */

var Comment=React.createClass({
	render:function(){
		//为了展示moji表情，这里用了Dangerously Set innerHTML
		return (
			<div className="panel panel-info">
				<div className="panel-heading">
					<h3 className="panel-title">
						<span className="glyphicon glyphicon-user">&nbsp;{this.props.author}</span>
					</h3>
				</div>
				<div className="panel-body" dangerouslySetInnerHTML={{__html:this.props.children.toString()}}>
				</div>
			</div>
		);
	}
});

var CommentList=React.createClass({
	render:function(){
		var commentNodes=this.props.data.map(function(comment) {
			return (
				<Comment author={comment.author} key={comment.id}>{comment.text}</Comment>
			);
		});
		return (
			<div className="commentList">
				{commentNodes}
			</div>
		);
	}
});

var CommentForm=React.createClass({
	getInitialState:function(){
		return { author:'',text:'',editor:null}
	},
	handleAuthorChange:function(e){
		this.setState({author:e.target.value});
	},
	handleTextChange:function(text){
		this.setState({text:text});
	},
	handleSubmit:function(e){
		var form=e.target;
		e.preventDefault();
		var author=this.state.author.trim(),
			text=this.state.text.trim();
		if(!author||!text) return;
		this.props.onCommentSubmit({author:author,text:text});
		this.setState({
			author:'',
			text:''
		});
		//刚开始学习，这里不知道有没有很好的办法来获取ueditor，暂且放到state中了。
		this.state.editor.setContent('');
		
	},
	setEditor:function(editor){
		this.setState({editor:editor});
	},
	render:function(){
		return (
			<form className="form-horizontal" onSubmit={this.handleSubmit}>
				<div className="form-group">
					<div className="col-sm-12">
						<input type="text" 
								className="form-control" 
								onChange={this.handleAuthorChange} 
								value={this.state.author}
								placeholder="Your Name" />
					</div>
				</div>
				<div className="form-group">
					<div className="col-sm-12">
						<Ueditor id="ueditor" value={this.state.text} ueditor={this.setEditor} onTextChange={this.handleTextChange} />
					</div>
				</div>
				<div className="form-group">
					<div className="col-sm-12">
						<input type="submit" 
								className="form-control btn btn-primary" 
								value="发表"/>
					</div>
				</div>
			</form>
		);
	}
});

//再次封装ueditor

var Ueditor=React.createClass({
	componentDidMount:function(){
		var editor=UE.getEditor(this.props.id);
		this.props.ueditor(editor);
		var self=this;
		editor.ready(function(ueditor){

			editor.addListener('contentChange selectionchange',function(){
				var text=editor.getContent();
				self.props.onTextChange(text);
			});
		});
	},
	render:function(){
		return <script id={this.props.id}  type="text/plain">{this.props.text}</script>
	}
});

var CommentBox=React.createClass({
	getInitialState:function(){
		return {data:[]}
	},
	componentDidMount:function(){
		this.loadCommentsFromServer();
		//setInterval(this.loadCommentsFromServer(),this.props.pollInterval);
	},
	loadCommentsFromServer:function(){
		$.ajax({
			url:this.props.url,
			dataType:'json',
			cache:false,
			success:function(data){
				this.setState({
					data:data
				})
			}.bind(this),
			error:function(xhr,status,err){
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	handleSubmitComment:function(comment){
		var comments=this.state.data;
		comment.id=Date.now();
		var newComments=comments.concat([comment]);
		this.setState({
			data:newComments
		});;
		var self=this;	
		$.ajax({
			url:this.props.url,
			dataType:'json',
			type:'post',
			cache:false,
			data:comment,
			success:function(data){
				this.setState({
					data:data
				})
			}.bind(this),
			error:function(xhr,status,err){
				this.setState({
					data:comments
				});
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	render:function(){
		return (
			<div className="commentbox">
				<h1>评论</h1>
				<CommentList data={this.state.data} />
				<CommentForm onCommentSubmit={this.handleSubmitComment} />
			</div>
		);
	}
});

ReactDOM.render(<CommentBox url="api/comments" pollInterval={2000} />,document.getElementById('example'));

setTimeout(function(){
	uParse('.panel-body', {
		 rootPath: '../'
	})
},1000)
