import { Link } from 'react-router-dom';

const Card = ({
    name,
    path,
    description,
}: {
    name?: string;
    description?: string;
    path: string;
}) => {
    return (
        <Link to={path} className="border hover:scale-[101%] cursor-pointer transition-all border-pink-300 rounded-xl hover:bg-pink-100 bg-pink-50 p-4">
                <h3 style={{
                    lineHeight: '1.5',
                    margin: '0em 0'
                }}
                className="font-bold text-pink-900">
                    {name || 'Tool Name'}
                </h3>
                <p className="text-sm text-pink-900/60">
                    {description || 'This is a tool description.'}
                </p>
        </Link>
    );
};

export default Card;
