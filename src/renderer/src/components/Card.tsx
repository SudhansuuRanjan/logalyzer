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
                <h2 className="text-lg font-bold text-pink-900">
                    {name || 'Tool Name'}
                </h2>
                <p className="text-sm text-pink-900/60">
                    {description || 'This is a tool description.'}
                </p>
        </Link>
    );
};

export default Card;
