import { MarketplacePage } from "@/components/game/marketplace/MarketplacePage";
import { useNavigate } from "react-router-dom";

const Marketplace = () => {
  const navigate = useNavigate();
  
  return <MarketplacePage onBack={() => navigate("/app")} />;
};

export default Marketplace;
