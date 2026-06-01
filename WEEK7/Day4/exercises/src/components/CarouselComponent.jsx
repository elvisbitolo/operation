import React from 'react';
import "react-responsive-carousel/lib/styles/carousel.min.css"; 
import { Carousel } from 'react-responsive-carousel';

const CarouselComponent = () => {
    return (
        <div className="carousel-container exercise-card">
            <h2>Daily Challenge: React Carousel</h2>
            <Carousel autoPlay infiniteLoop interval={3000} showStatus={false}>
                <div>
                    <img src="https://res.cloudinary.com/dz909867/image/upload/v1588164800/hong-kong_szv9re.jpg" alt="Hong Kong" />
                    <p className="legend">Hong Kong</p>
                </div>
                <div>
                    <img src="https://res.cloudinary.com/dz909867/image/upload/v1588164800/macao_v8m7u2.jpg" alt="Macao" />
                    <p className="legend">Macao</p>
                </div>
                <div>
                    <img src="https://res.cloudinary.com/dz909867/image/upload/v1588164800/japan_ksv7w4.jpg" alt="Japan" />
                    <p className="legend">Japan</p>
                </div>
                <div>
                    <img src="https://res.cloudinary.com/dz909867/image/upload/v1588164800/las-vegas_miv030.jpg" alt="Las Vegas" />
                    <p className="legend">Las Vegas</p>
                </div>
            </Carousel>
        </div>
    );
};

export default CarouselComponent;
