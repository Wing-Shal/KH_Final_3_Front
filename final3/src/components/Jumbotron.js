//페이지의 제목 역할을 하는 컴포넌트

function Jumbotron(props) {//props는 상위 컴포넌트에서 전달되는 값(=파라미터)
    return (
        <>
            <div className="row">
                <div className="col">
                    <div className="p-4 bg-dark text-light rounded">
                        <h1>{props.title}</h1>
                        <p>{props.content}</p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Jumbotron;