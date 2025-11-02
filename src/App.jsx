import { Routes, Route, useParams, useLocation } from "react-router-dom";
import Login from "./login";
import SignUp from "./SignUp";
import Update from "./Update";
import Profile from "./profile";
import UserDashboard from "./UserDashboard";
import SellerDashboard from "./SellerDeshboard";
import UpdateProduct from "./UpdateProduct";
import AddProductPhotos from "./AddPhotos";
import SingleProduct from "./pDet";
import Checkout from "./Checkout";
import Cart from "./Cart";
import Orders from "./Order";
import SellerOrders from "./Sellerproductmanager";
import NavBar from "./NavBar"; 
import Footer from "./footer";
import FAQs from "./FAQs";
import ReturnPolicy from "./ReturnPolicy";
import ShippingInfo from "./ShippingInfo";
import ContactUs from "./ContactUs";
import TermsConditions from "./TermsConditions";
import Search from "./Search"; 

// Wrappers for dynamic routes
function AddProductPhotosWrapper() {
  const { id } = useParams();
  return <AddProductPhotos productId={id} />;
}

function SingleProductWrapper() {
  const { id } = useParams();
  return <SingleProduct productId={id} />;
}

function CheckoutWrapper() {
  const { id } = useParams();
  return <Checkout productId={id} />;
}

export default function App() {
  const location = useLocation();

  const hideNav = ["/login", "/signup"].includes(location.pathname);
  const hideFooter = ["/login", "/signup"].includes(location.pathname);

  return (
    <>
      {!hideNav && <NavBar />}

      <Routes>
        <Route path="/" element={<UserDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/update" element={<Update />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout/:id" element={<CheckoutWrapper />} />
        <Route path="/products/:id" element={<SingleProductWrapper />} />
        
        <Route path="/products/search/:query" element={<Search />} />

        <Route path="/seller/dashboard" element={<SellerDashboard />} />
        <Route path="/seller/orders" element={<SellerOrders />} />
        <Route path="/seller/update/:id" element={<UpdateProduct />} />
        <Route path="/seller/products/:id/photos" element={<AddProductPhotosWrapper />} />

        {/* Info pages */}
        <Route path="/faq" element={<FAQs />} />
        <Route path="/returns" element={<ReturnPolicy />} />
        <Route path="/shipping" element={<ShippingInfo />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/terms" element={<TermsConditions />} />
      </Routes>

      {!hideFooter && <Footer />}
    </>
  );
}
