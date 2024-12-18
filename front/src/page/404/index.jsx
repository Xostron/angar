import Header from '@cmp/header';
import Menu from "@cmp/menu";
import './style.css'

export default function NotFound({header}) {
    return (
        <>
            {header && <Header>
                <Menu />
            </Header>}
            <div className='container'>
                <img src='/img/404.svg' className='img'/>
            </div>

        </>
    )
}
