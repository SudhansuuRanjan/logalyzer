import React from 'react';
import { Link } from 'react-router-dom';

const Tool = ({
    name,
    path,
    description,
    Icon,
}: {
    name?: string;
    description?: string;
    path: string;
    Icon?: React.ElementType;
}) => {
    return (
        <Link to={path} className="border hover:scale-[101%] cursor-pointer transition-all border-pink-300 rounded-xl hover:bg-pink-100 bg-pink-50">
            <div className="flex items-center gap-2 p-4">
                {Icon && <Icon className="text-pink-500 self-start size-10" />}
                <div>
                    <h3 style={{
                    lineHeight: '1.5',
                    margin: '0em 0'
                }} className="font-bold text-pink-900">
                        {name || 'Tool Name'}
                    </h3>
                    <p className="text-sm text-pink-900/60">
                        {description || 'This is a tool description.'}
                    </p>
                </div>
            </div>
        </Link>
    );
};

export default Tool;
